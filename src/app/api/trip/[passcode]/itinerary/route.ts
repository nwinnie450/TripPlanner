import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { addItineraryItemSchema } from "@/lib/validation";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import { generateId } from "@/lib/utils";
import type { ItineraryItem, ItineraryCategory } from "@/types";

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

    const items = [...trip.itinerary];
    items.sort((a, b) => {
      const dateCompare = a.dayDate.localeCompare(b.dayDate);
      if (dateCompare !== 0) return dateCompare;
      return (a.time || "99:99").localeCompare(b.time || "99:99");
    });

    return NextResponse.json({ items });
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
    const parsed = addItineraryItemSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const now = new Date().toISOString();
    const item: ItineraryItem = {
      itemId: generateId(),
      dayDate: parsed.data.dayDate,
      time: parsed.data.time ?? "",
      title: parsed.data.title,
      location: parsed.data.location ?? "",
      ...(parsed.data.locationLat != null && { locationLat: parsed.data.locationLat }),
      ...(parsed.data.locationLng != null && { locationLng: parsed.data.locationLng }),
      ...(parsed.data.category != null && { category: parsed.data.category as ItineraryCategory }),
      notes: parsed.data.notes ?? "",
      createdBy: parsed.data.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $push: { itinerary: item } as any,
        $set: { updatedAt: now },
      } as any
    );

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
