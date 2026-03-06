'use client';

import { useState } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useSettlement } from '@/hooks/useSettlement';
import BalanceCard from '@/components/settlement/BalanceCard';
import TransactionCard from '@/components/settlement/TransactionCard';
import ExchangeRateForm from '@/components/settlement/ExchangeRateForm';
import ShareButton from '@/components/ui/ShareButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatSettlementText } from '@/lib/formatExport';

export default function SettlementPage() {
  const { passcode } = useTripContext();
  const { trip, mutate: mutateTrip } = useTrip(passcode);
  const { groups, payments, isLoading, error, mutate } = useSettlement(passcode);
  const [convertMode, setConvertMode] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load settlement." />;

  const baseCurrency = trip?.currency ?? 'USD';
  const hasMultipleCurrencies = groups.length > 1;
  const nonBaseCurrencies = groups
    .map((g) => g.currency)
    .filter((c) => c !== baseCurrency);

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

  async function handleSaveRate(fromCurrency: string, rate: number) {
    const currentRates = trip?.exchangeRates ?? {};
    const updatedRates = { ...currentRates, [fromCurrency]: rate };
    await fetch(`/api/trip/${passcode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchangeRates: updatedRates }),
    });
    mutateTrip();
    mutate();
  }

  const hasData = groups.some((g) => g.balances.length > 0 || g.transactions.length > 0);

  // For share: use first group's data (or all if single currency)
  const firstGroup = groups[0];

  // Group balances by member (one card per person)
  const balancesByMember = new Map<
    string,
    { memberName: string; entries: { currency: string; net: number }[] }
  >();
  groups.forEach((group) => {
    group.balances.forEach((b) => {
      const existing = balancesByMember.get(b.memberId) || {
        memberName: b.memberName,
        entries: [],
      };
      existing.entries.push({ currency: group.currency, net: b.net });
      balancesByMember.set(b.memberId, existing);
    });
  });

  // Group transactions by payer (one card per person)
  const debtsByPayer = new Map<
    string,
    {
      fromName: string;
      debts: {
        to: string;
        toName: string;
        currency: string;
        amount: number;
        remaining: number;
        paid: number;
      }[];
    }
  >();
  groups.forEach((group) => {
    group.transactions.forEach((tx) => {
      const existing = debtsByPayer.get(tx.from) || {
        fromName: tx.fromName,
        debts: [],
      };
      existing.debts.push({
        to: tx.to,
        toName: tx.toName,
        currency: group.currency,
        amount: tx.amount,
        remaining: tx.remaining,
        paid: tx.paid,
      });
      debtsByPayer.set(tx.from, existing);
    });
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-6 pt-12">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[28px] font-bold text-white">
              Settlement
            </h1>
            <p className="mt-1 text-[15px] text-white/80">Who owes whom</p>
          </div>
          {hasData && firstGroup && (
            <ShareButton
              getShareData={() => ({
                title: `${trip?.tripName ?? 'Trip'} Settlement`,
                text: formatSettlementText(
                  trip?.tripName ?? 'Trip',
                  firstGroup.currency,
                  firstGroup.balances,
                  firstGroup.transactions,
                ),
              })}
            />
          )}
        </div>
      </div>

      <div className="bg-white p-6">
        {!hasData ? (
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
            {hasMultipleCurrencies && (
              <div className="mb-6">
                <button
                  onClick={() => setConvertMode(!convertMode)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                    convertMode
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {convertMode ? `Converting to ${baseCurrency}` : `Convert to ${baseCurrency}`}
                </button>

                {convertMode && (
                  <div className="mt-4 flex flex-col gap-3">
                    {nonBaseCurrencies.map((cur) => (
                      <ExchangeRateForm
                        key={cur}
                        fromCurrency={cur}
                        toCurrency={baseCurrency}
                        currentRate={trip?.exchangeRates?.[cur]}
                        onSave={(rate) => handleSaveRate(cur, rate)}
                      />
                    ))}
                    <p className="text-[12px] text-slate-400">
                      Enter rates and settlement will recalculate automatically.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Net Balances — one card per person */}
            {balancesByMember.size > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
                  Net Balances
                </h2>
                <div className="flex flex-col gap-2">
                  {[...balancesByMember.entries()].map(
                    ([memberId, { memberName, entries }], index) => (
                      <BalanceCard
                        key={memberId}
                        memberName={memberName}
                        entries={entries}
                        colorIndex={index}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Settle Up — one card per payer */}
            {debtsByPayer.size > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
                  Settle Up
                </h2>
                <div className="flex flex-col gap-3">
                  {[...debtsByPayer.entries()].map(
                    ([fromId, { fromName, debts }], index) => (
                      <TransactionCard
                        key={fromId}
                        from={fromId}
                        fromName={fromName}
                        debts={debts}
                        payments={payments}
                        onRecordPayment={handleRecordPayment}
                        colorIndex={index}
                      />
                    ),
                  )}
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
