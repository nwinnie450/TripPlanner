import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { getCollection } from "@/lib/mongodb";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
import { generateId } from "@/lib/utils";
import type { Payment } from "@/types";

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

    const payments: Payment[] = trip.payments ?? [];

    return NextResponse.json({ payments });
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
    const { from, to, amount, currency, note, date } = body;

    if (!from || !to || !amount || !date) {
      throw new ApiError("VALIDATION_ERROR", "from, to, amount, and date are required", 400);
    }

    if (typeof amount !== "number" || amount <= 0) {
      throw new ApiError("VALIDATION_ERROR", "amount must be a positive number", 400);
    }

    const memberIds = new Set(trip.members.map((m) => m.memberId));
    if (!memberIds.has(from)) {
      throw new ApiError("VALIDATION_ERROR", "from must be a valid member ID", 400);
    }
    if (!memberIds.has(to)) {
      throw new ApiError("VALIDATION_ERROR", "to must be a valid member ID", 400);
    }

    const now = new Date().toISOString();
    const payment: Payment = {
      paymentId: generateId(),
      from,
      to,
      amount: Math.round(amount * 100) / 100,
      currency: currency || undefined,
      note: note || undefined,
      date,
      createdAt: now,
    };

    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $push: { payments: payment } as any,
        $set: { updatedAt: now },
      }
    );

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
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

    const { paymentId } = await request.json();
    if (!paymentId) {
      throw new ApiError("VALIDATION_ERROR", "paymentId is required", 400);
    }

    const exists = (trip.payments ?? []).some((p) => p.paymentId === paymentId);
    if (!exists) {
      throw new ApiError("NOT_FOUND", "Payment not found", 404);
    }

    const now = new Date().toISOString();
    const collection = await getCollection("trips");
    await collection.updateOne(
      { passcode: passcode.toUpperCase() },
      {
        $pull: { payments: { paymentId } } as any,
        $set: { updatedAt: now },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
