import { NextRequest, NextResponse } from "next/server";
import { validatePasscodeFormat, lookupTrip } from "@/lib/passcode";
import { calculateMultiCurrencySettlement, calculateRemainingTransactions } from "@/lib/settlement";
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
    const members = trip.members ?? [];

    // Group payments by currency to match settlement currency groups
    const paymentsByCurrency = new Map<string, { from: string; to: string; amount: number }[]>();
    for (const p of payments) {
      const currency = p.currency ?? trip.currency;
      if (!paymentsByCurrency.has(currency)) {
        paymentsByCurrency.set(currency, []);
      }
      paymentsByCurrency.get(currency)!.push({ from: p.from, to: p.to, amount: p.amount });
    }

    // For each currency group, recalculate transactions factoring in payments
    const groups = settlements.map((settlement) => {
      const currencyPayments = paymentsByCurrency.get(settlement.currency) ?? [];

      // Calculate remaining transactions after accounting for payments
      const remainingTransactions = calculateRemainingTransactions(
        settlement.balances,
        currencyPayments,
        members,
      );

      // Enrich with paid=0, remaining=amount (these ARE the remaining amounts)
      const enrichedTransactions = remainingTransactions.map((tx) => ({
        ...tx,
        paid: 0,
        remaining: tx.amount,
      }));

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
