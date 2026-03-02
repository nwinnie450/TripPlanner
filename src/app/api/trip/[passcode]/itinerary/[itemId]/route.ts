import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { updateItineraryItemSchema } from "@/lib/validation";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ passcode: string; itemId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitGeneral(ip);
    if (!rl.allowed) {
      throw new ApiError("RATE_LIMITED", "Too many requests", 429);
    }

    const { passcode, itemId } = await params;
    if (!validatePasscodeFormat(passcode.toUpperCase())) {
      throw new ApiError("INVALID_PASSCODE", "Invalid passcode format", 404);
    }

    const trip = await lookupTrip(passcode);
    if (!trip) {
      throw new ApiError("INVALID_PASSCODE", "Trip not found", 404);
    }

    const body = await request.json();
    const parsed = updateItineraryItemSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const existing = trip.itinerary.find((i) => i.itemId === itemId);
    if (!existing) {
      throw new ApiError("ITEM_NOT_FOUND", "Itinerary item not found", 404);
    }

    const now = new Date().toISOString();
    const setFields: Record<string, unknown> = {
      "itinerary.$[elem].updatedAt": now,
      updatedAt: now,
    };

    if (parsed.data.dayDate !== undefined)
      setFields["itinerary.$[elem].dayDate"] = parsed.data.dayDate;
    if (parsed.data.time !== undefined)
      setFields["itinerary.$[elem].time"] = parsed.data.time;
    if (parsed.data.title !== undefined)
      setFields["itinerary.$[elem].title"] = parsed.data.title;
    if (parsed.data.location !== undefined)
      setFields["itinerary.$[elem].location"] = parsed.data.location;
    if (parsed.data.locationLat !== undefined)
      setFields["itinerary.$[elem].locationLat"] = parsed.data.locationLat;
    if (parsed.data.locationLng !== undefined)
      setFields["itinerary.$[elem].locationLng"] = parsed.data.locationLng;
    if (parsed.data.category !== undefined)
      setFields["itinerary.$[elem].category"] = parsed.data.category;
    if (parsed.data.transportMode !== undefined)
      setFields["itinerary.$[elem].transportMode"] = parsed.data.transportMode;
    if (parsed.data.notes !== undefined)
      setFields["itinerary.$[elem].notes"] = parsed.data.notes;

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      { $set: setFields },
      { arrayFilters: [{ "elem.itemId": itemId }] }
    );

    const updated = {
      ...existing,
      ...(parsed.data.dayDate !== undefined && {
        dayDate: parsed.data.dayDate,
      }),
      ...(parsed.data.time !== undefined && { time: parsed.data.time }),
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.location !== undefined && {
        location: parsed.data.location,
      }),
      ...(parsed.data.locationLat !== undefined && { locationLat: parsed.data.locationLat }),
      ...(parsed.data.locationLng !== undefined && { locationLng: parsed.data.locationLng }),
      ...(parsed.data.category !== undefined && { category: parsed.data.category }),
      ...(parsed.data.transportMode !== undefined && { transportMode: parsed.data.transportMode }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      updatedAt: now,
    };

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ passcode: string; itemId: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitGeneral(ip);
    if (!rl.allowed) {
      throw new ApiError("RATE_LIMITED", "Too many requests", 429);
    }

    const { passcode, itemId } = await params;
    if (!validatePasscodeFormat(passcode.toUpperCase())) {
      throw new ApiError("INVALID_PASSCODE", "Invalid passcode format", 404);
    }

    const trip = await lookupTrip(passcode);
    if (!trip) {
      throw new ApiError("INVALID_PASSCODE", "Trip not found", 404);
    }

    const existing = trip.itinerary.find((i) => i.itemId === itemId);
    if (!existing) {
      throw new ApiError("ITEM_NOT_FOUND", "Itinerary item not found", 404);
    }

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $pull: { itinerary: { itemId } },
        $set: { updatedAt: new Date().toISOString() },
      } as any
    );

    return NextResponse.json({ deleted: true, itemId });
  } catch (error) {
    return handleApiError(error);
  }
}
