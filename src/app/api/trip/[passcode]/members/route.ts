import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { MEMBER_LIMIT } from "@/lib/constants";
import { addMemberSchema } from "@/lib/validation";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import { generateId } from "@/lib/utils";
import type { Member } from "@/types";

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

    return NextResponse.json({ members: trip.members });
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
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    if (trip.members.length >= MEMBER_LIMIT) {
      throw new ApiError(
        "MEMBER_LIMIT_REACHED",
        `Trip already has ${MEMBER_LIMIT} members`,
        409
      );
    }

    const member: Member = {
      memberId: generateId(),
      name: parsed.data.name,
      joinedAt: new Date().toISOString(),
    };

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $push: { members: member },
        $set: { updatedAt: new Date().toISOString() },
      } as any
    );

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
