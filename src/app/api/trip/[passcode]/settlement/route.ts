import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { calculateMultiCurrencySettlement } from "@/lib/settlement";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";
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

    const settlements = calculateMultiCurrencySettlement(
      trip.expenses ?? [],
      trip.members ?? [],
      trip.currency,
      trip.exchangeRates,
    );

    const payments: Payment[] = trip.payments ?? [];

    // Calculate paid amounts per transaction (from->to pair), grouped by currency
    const paidMap = new Map<string, number>();
    for (const p of payments) {
      const currency = p.currency ?? trip.currency;
      const key = `${currency}:${p.from}->${p.to}`;
      paidMap.set(key, (paidMap.get(key) ?? 0) + p.amount);
    }

    // Enrich transactions with paid/remaining info per currency group
    const groups = settlements.map((settlement) => {
      const enrichedTransactions = settlement.transactions.map((tx) => {
        const key = `${settlement.currency}:${tx.from}->${tx.to}`;
        const paid = Math.round((paidMap.get(key) ?? 0) * 100) / 100;
        const remaining = Math.round(Math.max(0, tx.amount - paid) * 100) / 100;
        return { ...tx, paid, remaining };
      });
      return {
        currency: settlement.currency,
        balances: settlement.balances,
        transactions: enrichedTransactions,
      };
    });

    return NextResponse.json({
      groups,
      payments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
