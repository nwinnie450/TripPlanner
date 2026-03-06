import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { updateChecklistItemSchema } from "@/lib/validation";
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
    const parsed = updateChecklistItemSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const existing = (trip.checklist ?? []).find(
      (i) => i.checklistItemId === itemId
    );
    if (!existing) {
      throw new ApiError("ITEM_NOT_FOUND", "Checklist item not found", 404);
    }

    const now = new Date().toISOString();
    const setFields: Record<string, unknown> = {
      updatedAt: now,
    };

    if (parsed.data.text !== undefined)
      setFields["checklist.$[elem].text"] = parsed.data.text;
    if (parsed.data.assignee !== undefined)
      setFields["checklist.$[elem].assignee"] = parsed.data.assignee;
    if (parsed.data.packed !== undefined)
      setFields["checklist.$[elem].packed"] = parsed.data.packed;

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      { $set: setFields },
      { arrayFilters: [{ "elem.checklistItemId": itemId }] }
    );

    const updated = {
      ...existing,
      ...(parsed.data.text !== undefined && { text: parsed.data.text }),
      ...(parsed.data.assignee !== undefined && {
        assignee: parsed.data.assignee,
      }),
      ...(parsed.data.packed !== undefined && { packed: parsed.data.packed }),
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

    const existing = (trip.checklist ?? []).find(
      (i) => i.checklistItemId === itemId
    );
    if (!existing) {
      throw new ApiError("ITEM_NOT_FOUND", "Checklist item not found", 404);
    }

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $pull: { checklist: { checklistItemId: itemId } },
        $set: { updatedAt: new Date().toISOString() },
      } as any
    );

    return NextResponse.json({ deleted: true, itemId });
  } catch (error) {
    return handleApiError(error);
  }
}
