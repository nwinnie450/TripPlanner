import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { importExpensesSchema } from "@/lib/validation";
import { buildDedupKey, buildExistingDedupKeys } from "@/lib/expenseImport";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import { generateId } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ passcode: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitGeneral(ip);
    if (!rl.allowed) {
      throw new ApiError("RATE_LIMITED", "Too many requests", 429);
    }

    const { passcode } = await params;
    if (!validatePasscodeFormat(passcode.toUpperCase())) {
      throw new ApiError("INVALID_PASSCODE", "Invalid passcode format", 404);
    }

    const trip = await lookupTrip(passcode);
    if (!trip) {
      throw new ApiError("INVALID_PASSCODE", "Trip not found", 404);
    }

    const body = await request.json();
    const parsed = importExpensesSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const memberIds = new Set(trip.members.map((m) => m.memberId));
    for (const item of parsed.data.expenses) {
      if (!memberIds.has(item.paidBy)) {
        throw new ApiError(
          "VALIDATION_ERROR",
          `paidBy must be a valid member ID (got "${item.paidBy}")`,
          400
        );
      }
      const invalidSplitIds = item.splitBetween.filter((id) => !memberIds.has(id));
      if (invalidSplitIds.length > 0) {
        throw new ApiError(
          "VALIDATION_ERROR",
          `Invalid member IDs in splitBetween: ${invalidSplitIds.join(", ")}`,
          400
        );
      }
    }

    const existingKeys = buildExistingDedupKeys(trip.expenses ?? []);
    const seenInBatch = new Set<string>();
    const now = new Date().toISOString();
    const toInsert: Expense[] = [];
    let skippedCount = 0;
    const skippedDescriptions: string[] = [];

    for (const item of parsed.data.expenses) {
      const key = buildDedupKey({
        date: item.date,
        description: item.description,
        amount: item.amount,
      });
      if (existingKeys.has(key) || seenInBatch.has(key)) {
        skippedCount++;
        skippedDescriptions.push(item.description);
        continue;
      }
      seenInBatch.add(key);
      toInsert.push({
        expenseId: generateId(),
        amount: item.amount,
        description: item.description,
        category: item.category as ExpenseCategory,
        paidBy: item.paidBy,
        splitBetween: item.splitBetween,
        date: item.date,
        ...(item.currency !== undefined && { currency: item.currency }),
        ...(item.expenseType !== undefined && { expenseType: item.expenseType }),
        createdBy: parsed.data.createdBy,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (toInsert.length > 0) {
      const collection = await getCollection("trips");
      await collection.updateOne(
        { passcode: passcode.toUpperCase() },
        {
          $push: { expenses: { $each: toInsert } } as any,
          $set: { updatedAt: now },
        }
      );
    }

    return NextResponse.json({
      imported: toInsert,
      importedCount: toInsert.length,
      skippedCount,
      skippedDescriptions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
