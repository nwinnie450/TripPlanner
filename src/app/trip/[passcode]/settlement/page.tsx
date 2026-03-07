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

  async function handleRecordPayment(from: string, to: string, amount: number, currency: string, note: string) {
    await fetch(`/api/trip/${passcode}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        amount,
        currency,
        note: note || undefined,
        date: new Date().toISOString().split('T')[0],
      }),
    });
    mutate();
  }

  async function handleDeletePayment(paymentId: string) {
    await fetch(`/api/trip/${passcode}/payments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#EC4899] px-6 pb-8 pt-12">
        <span className="pointer-events-none absolute -right-2 -top-2 text-[64px] opacity-20 rotate-12 select-none">
          💸
        </span>
        <span className="pointer-events-none absolute right-16 top-8 text-[40px] opacity-15 -rotate-6 select-none">
          🤝
        </span>
        <span className="pointer-events-none absolute left-2 bottom-2 text-[48px] opacity-15 rotate-6 select-none">
          💳
        </span>
        <span className="pointer-events-none absolute right-8 bottom-0 text-[36px] opacity-15 select-none">
          🧾
        </span>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-white drop-shadow-md">
              Settlement
            </h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <span className="text-[13px] font-medium text-white">Who owes whom</span>
            </div>
          </div>
          {hasData && (
            <ShareButton
              getShareData={() => ({
                title: `${trip?.tripName ?? 'Trip'} Settlement`,
                text: formatSettlementText(
                  trip?.tripName ?? 'Trip',
                  groups,
                ),
              })}
            />
          )}
        </div>
      </div>

      <div className="p-6">
        {!hasData ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-[56px] mb-3">🎉</span>
            <p className="font-[family-name:var(--font-display)] text-[18px] font-bold text-slate-900">
              All settled!
            </p>
            <p className="mt-1 text-[13px] text-slate-500">
              No expenses recorded yet, or everyone is even.
            </p>
          </div>
        ) : (
          <>
            {hasMultipleCurrencies && (
              <div className="mb-6">
                <button
                  onClick={() => setConvertMode(!convertMode)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all shadow-sm ${
                    convertMode
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-md'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {convertMode ? `Converting to ${baseCurrency} 💱` : `Convert to ${baseCurrency} 💱`}
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

            {/* Net Balances -- one card per person */}
            {balancesByMember.size > 0 && (() => {
              const globalMaxAbsolute = Math.max(
                ...[...balancesByMember.values()].map(({ entries }) =>
                  Math.max(...entries.map((e) => Math.abs(e.net)), 0),
                ),
                0,
              );
              return (
              <div className="mb-6">
                <h2 className="mb-3 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
                  <span>💰</span> Net Balances
                </h2>
                <div className="flex flex-col gap-2.5">
                  {[...balancesByMember.entries()].map(
                    ([memberId, { memberName, entries }], index) => (
                      <BalanceCard
                        key={memberId}
                        memberName={memberName}
                        entries={entries}
                        colorIndex={index}
                        globalMaxAbsolute={globalMaxAbsolute}
                      />
                    ),
                  )}
                </div>
              </div>
              );
            })()}

            {/* Settle Up -- one card per payer */}
            {debtsByPayer.size > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
                  <span>🧾</span> Settle Up
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
                        onDeletePayment={handleDeletePayment}
                        colorIndex={index}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="rounded-[20px] bg-gradient-to-r from-[#F0FDFA] to-[#ECFDF5] p-4 shadow-sm">
              <p className="text-[13px] text-[#14B8A6]">
                <span className="mr-1">💡</span>
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
