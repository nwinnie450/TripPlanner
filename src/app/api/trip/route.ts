import { NextRequest, NextResponse } from "next/server";
import { createTripSchema } from "@/lib/validation";
import { generatePasscode, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import type { TripDocument } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitGeneral(ip);
    if (!rl.allowed) {
      throw new ApiError("RATE_LIMITED", "Too many requests", 429);
    }

    const body = await request.json();
    const parsed = createTripSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const { tripName, startDate, endDate, currency } = parsed.data;

    let passcode: string = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = generatePasscode();
      const existing = await lookupTrip(candidate);
      if (!existing) {
        passcode = candidate;
        break;
      }
    }
    if (!passcode) {
      throw new ApiError(
        "INTERNAL_ERROR",
        "Failed to generate unique passcode",
        500
      );
    }

    const now = new Date().toISOString();

    const tripDoc: TripDocument = {
      passcode,
      tripName,
      startDate,
      endDate,
      currency,
      budget: 0,
      members: [],
      itinerary: [],
      expenses: [],
      createdAt: now,
      updatedAt: now,
    };

    const collection = await getCollection("trips");
    await collection.insertOne(tripDoc);

    return NextResponse.json({ passcode, tripName }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
