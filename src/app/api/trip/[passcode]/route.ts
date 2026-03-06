import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { updateTripSchema } from "@/lib/validation";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";

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

    const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      tripName: trip.tripName,
      startDate: trip.startDate,
      endDate: trip.endDate,
      currency: trip.currency,
      currencies: trip.currencies ?? [],
      exchangeRates: trip.exchangeRates ?? {},
      budget: trip.budget,
      budgetPerPax: trip.budgetPerPax,
      passcode: trip.passcode,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      memberCount: trip.members.length,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
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
    const parsed = updateTripSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const { tripName, startDate, endDate, currency, budget, budgetPerPax, currencies, exchangeRates } = parsed.data;

    const effectiveStartDate = startDate ?? trip.startDate;
    const effectiveEndDate = endDate ?? trip.endDate;
    if (effectiveEndDate < effectiveStartDate) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "End date must be on or after start date",
        400
      );
    }

    const $set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (tripName !== undefined) $set.tripName = tripName;
    if (startDate !== undefined) $set.startDate = startDate;
    if (endDate !== undefined) $set.endDate = endDate;
    if (currency !== undefined) $set.currency = currency;
    if (budgetPerPax !== undefined) {
      $set.budgetPerPax = budgetPerPax;
      $set.budget = budgetPerPax * trip.members.length;
    } else if (budget !== undefined) {
      $set.budget = budget;
    }
    if (currencies !== undefined) $set.currencies = currencies;
    if (exchangeRates !== undefined) $set.exchangeRates = exchangeRates;

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      { $set }
    );

    return NextResponse.json({
      tripName: tripName ?? trip.tripName,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      currency: currency ?? trip.currency,
      budget: ($set.budget as number) ?? trip.budget,
      budgetPerPax: budgetPerPax ?? trip.budgetPerPax,
      passcode: trip.passcode,
      createdAt: trip.createdAt,
      updatedAt: $set.updatedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
