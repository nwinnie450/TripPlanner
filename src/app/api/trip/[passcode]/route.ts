import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { updateBudgetSchema } from "@/lib/validation";
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
      budget: trip.budget,
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
    const parsed = updateBudgetSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const now = new Date().toISOString();
    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      { $set: { budget: parsed.data.budget, updatedAt: now } }
    );

    return NextResponse.json({
      tripName: trip.tripName,
      startDate: trip.startDate,
      endDate: trip.endDate,
      currency: trip.currency,
      budget: parsed.data.budget,
      passcode: trip.passcode,
      createdAt: trip.createdAt,
      updatedAt: now,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
