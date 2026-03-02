'use client';

import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useSettlement } from '@/hooks/useSettlement';
import BalanceCard from '@/components/settlement/BalanceCard';
import TransactionCard from '@/components/settlement/TransactionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function SettlementPage() {
  const { passcode } = useTripContext();
  const { trip } = useTrip(passcode);
  const { balances, transactions, payments, isLoading, error, mutate } = useSettlement(passcode);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load settlement." />;

  const currency = trip?.currency ?? 'USD';
  const maxAbsolute = Math.max(...balances.map((b) => Math.abs(b.net)), 0);

  async function handleRecordPayment(from: string, to: string, amount: number, note: string) {
    await fetch(`/api/trip/${passcode}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        amount,
        note: note || undefined,
        date: new Date().toISOString().split('T')[0],
      }),
    });
    mutate();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-6 pt-12">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-bold text-white">
          Settlement
        </h1>
        <p className="mt-1 text-[15px] text-white/80">Who owes whom</p>
      </div>

      <div className="bg-white p-6">
        {balances.length === 0 && transactions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-slate-900">
              All settled!
            </p>
            <p className="mt-1 text-[13px] text-slate-600">
              No expenses recorded yet, or everyone is even.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
                Net Balances
              </h2>
              <div className="flex flex-col gap-2">
                {balances.map((balance, index) => (
                  <BalanceCard
                    key={balance.memberId}
                    balance={balance}
                    maxAbsolute={maxAbsolute}
                    currency={currency}
                    colorIndex={index}
                  />
                ))}
              </div>
            </div>

            {transactions.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
                  Settle Up
                </h2>
                <div className="flex flex-col gap-3">
                  {transactions.map((tx, i) => (
                    <TransactionCard
                      key={i}
                      transaction={tx}
                      currency={currency}
                      payments={payments}
                      onRecordPayment={handleRecordPayment}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#F0FDFA] p-4">
              <p className="text-[13px] text-[#14B8A6]">
                These transactions represent the minimum number of payments needed to settle all
                debts. You can record partial payments for large amounts.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
