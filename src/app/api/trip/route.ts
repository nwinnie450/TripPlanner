import { NextRequest, NextResponse } from "next/server";
import { createTripSchema } from "@/lib/validation";
import { generatePasscode, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";
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

    const { tripName, startDate, endDate, currency, currencies } = parsed.data;

    // Get the authenticated user to auto-add as first member
    const session = await getSessionUser();
    let creatorMember = null;
    if (session) {
      const usersCollection = await getCollection("users");
      const userDoc = await usersCollection.findOne({ userId: session.userId });
      if (userDoc) {
        creatorMember = {
          memberId: generateId(),
          name: userDoc.name as string,
          userId: session.userId,
          joinedAt: new Date().toISOString(),
        };
      }
    }

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
      currencies: currencies ?? [],
      budget: 0,
      members: creatorMember ? [creatorMember] : [],
      itinerary: [],
      expenses: [],
      payments: [],
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
