import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitPasscode } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitPasscode(ip);
    if (!rl.allowed) {
      throw new ApiError(
        "RATE_LIMITED",
        "Too many attempts. Try again later.",
        429
      );
    }

    const body = await request.json();
    const passcode = (body.passcode ?? "").toString().toUpperCase().trim();

    if (!validatePasscodeFormat(passcode)) {
      throw new ApiError("INVALID_PASSCODE", "Invalid passcode format", 404);
    }

    const trip = await lookupTrip(passcode);
    if (!trip) {
      throw new ApiError("INVALID_PASSCODE", "Trip not found", 404);
    }

    return NextResponse.json({
      valid: true,
      passcode: trip.passcode,
      tripName: trip.tripName,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
