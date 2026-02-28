import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { calculateSettlement } from "@/lib/settlement";
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

    const { balances, transactions } = calculateSettlement(
      trip.expenses,
      trip.members
    );

    return NextResponse.json({ balances, transactions });
  } catch (error) {
    return handleApiError(error);
  }
}
