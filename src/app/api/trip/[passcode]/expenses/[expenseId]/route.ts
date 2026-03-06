import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { updateExpenseSchema } from "@/lib/validation";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import type { ExpenseCategory } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ passcode: string; expenseId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitGeneral(ip);
    if (!rl.allowed) {
      throw new ApiError("RATE_LIMITED", "Too many requests", 429);
    }

    const { passcode, expenseId } = await params;
    if (!validatePasscodeFormat(passcode.toUpperCase())) {
      throw new ApiError("INVALID_PASSCODE", "Invalid passcode format", 404);
    }

    const trip = await lookupTrip(passcode);
    if (!trip) {
      throw new ApiError("INVALID_PASSCODE", "Trip not found", 404);
    }

    const body = await request.json();
    const parsed = updateExpenseSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const existing = trip.expenses.find((e) => e.expenseId === expenseId);
    if (!existing) {
      throw new ApiError("ITEM_NOT_FOUND", "Expense not found", 404);
    }

    const now = new Date().toISOString();
    const setFields: Record<string, unknown> = {
      "expenses.$[elem].updatedAt": now,
      updatedAt: now,
    };

    if (parsed.data.amount !== undefined)
      setFields["expenses.$[elem].amount"] = parsed.data.amount;
    if (parsed.data.description !== undefined)
      setFields["expenses.$[elem].description"] = parsed.data.description;
    if (parsed.data.category !== undefined)
      setFields["expenses.$[elem].category"] = parsed.data.category;
    if (parsed.data.paidBy !== undefined)
      setFields["expenses.$[elem].paidBy"] = parsed.data.paidBy;
    if (parsed.data.splitBetween !== undefined)
      setFields["expenses.$[elem].splitBetween"] = parsed.data.splitBetween;
    if (parsed.data.date !== undefined)
      setFields["expenses.$[elem].date"] = parsed.data.date;
    if (parsed.data.currency !== undefined)
      setFields["expenses.$[elem].currency"] = parsed.data.currency;
    if (parsed.data.expenseType !== undefined)
      setFields["expenses.$[elem].expenseType"] = parsed.data.expenseType;

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      { $set: setFields },
      { arrayFilters: [{ "elem.expenseId": expenseId }] }
    );

    const updated = {
      ...existing,
      ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description,
      }),
      ...(parsed.data.category !== undefined && {
        category: parsed.data.category as ExpenseCategory,
      }),
      ...(parsed.data.paidBy !== undefined && { paidBy: parsed.data.paidBy }),
      ...(parsed.data.splitBetween !== undefined && {
        splitBetween: parsed.data.splitBetween,
      }),
      ...(parsed.data.date !== undefined && { date: parsed.data.date }),
      ...(parsed.data.currency !== undefined && { currency: parsed.data.currency }),
      ...(parsed.data.expenseType !== undefined && { expenseType: parsed.data.expenseType }),
      updatedAt: now,
    };

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ passcode: string; expenseId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitGeneral(ip);
    if (!rl.allowed) {
      throw new ApiError("RATE_LIMITED", "Too many requests", 429);
    }

    const { passcode, expenseId } = await params;
    if (!validatePasscodeFormat(passcode.toUpperCase())) {
      throw new ApiError("INVALID_PASSCODE", "Invalid passcode format", 404);
    }

    const trip = await lookupTrip(passcode);
    if (!trip) {
      throw new ApiError("INVALID_PASSCODE", "Trip not found", 404);
    }

    const existing = trip.expenses.find((e) => e.expenseId === expenseId);
    if (!existing) {
      throw new ApiError("ITEM_NOT_FOUND", "Expense not found", 404);
    }

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $pull: { expenses: { expenseId } },
        $set: { updatedAt: new Date().toISOString() },
      } as any
    );

    return NextResponse.json({ deleted: true, expenseId });
  } catch (error) {
    return handleApiError(error);
  }
}
