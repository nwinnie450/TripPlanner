import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { addExpenseSchema } from "@/lib/validation";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import { generateId } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types";

export async function GET(
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

    let expenses = [...trip.expenses];

    const categoryParam = request.nextUrl.searchParams.get("category");
    if (categoryParam) {
      if (!EXPENSE_CATEGORIES.includes(categoryParam as ExpenseCategory)) {
        throw new ApiError(
          "VALIDATION_ERROR",
          `Invalid category: ${categoryParam}`,
          400
        );
      }
      expenses = expenses.filter(
        (e) => e.category === (categoryParam as ExpenseCategory)
      );
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      expenses,
      total: Math.round(total * 100) / 100,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const parsed = addExpenseSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const memberIds = new Set(trip.members.map((m) => m.memberId));

    if (!memberIds.has(parsed.data.paidBy)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "paidBy must be a valid member ID",
        400
      );
    }

    const invalidSplitIds = parsed.data.splitBetween.filter(
      (id) => !memberIds.has(id)
    );
    if (invalidSplitIds.length > 0) {
      throw new ApiError(
        "VALIDATION_ERROR",
        `Invalid member IDs in splitBetween: ${invalidSplitIds.join(", ")}`,
        400
      );
    }

    const now = new Date().toISOString();
    const expense: Expense = {
      expenseId: generateId(),
      amount: parsed.data.amount,
      description: parsed.data.description,
      category: parsed.data.category as ExpenseCategory,
      paidBy: parsed.data.paidBy,
      splitBetween: parsed.data.splitBetween,
      date: parsed.data.date,
      createdBy: parsed.data.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $push: { expenses: expense } as any,
        $set: { updatedAt: now },
      }
    );

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
