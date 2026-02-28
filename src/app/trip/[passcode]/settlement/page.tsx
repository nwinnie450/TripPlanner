'use client';

import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useSettlement } from '@/hooks/useSettlement';
import BalanceCard from '@/components/settlement/BalanceCard';
import TransactionCard from '@/components/settlement/TransactionCard';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function SettlementPage() {
  const { passcode } = useTripContext();
  const { trip } = useTrip(passcode);
  const { balances, transactions, isLoading, error } =
    useSettlement(passcode);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load settlement." />;

  const currency = trip?.currency ?? 'USD';
  const maxAbsolute = Math.max(
    ...balances.map((b) => Math.abs(b.net)),
    0,
  );

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Settlement</h1>
      <p className="mb-6 text-[13px] text-slate-600">Who owes whom</p>

      {balances.length === 0 && transactions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-[18px] font-semibold text-slate-900">
            All settled!
          </p>
          <p className="mt-1 text-[13px] text-slate-600">
            No expenses recorded yet, or everyone is even.
          </p>
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <p className="mb-3 text-[13px] font-semibold text-slate-600">
              Balances
            </p>
            {balances.map((balance) => (
              <BalanceCard
                key={balance.memberId}
                balance={balance}
                maxAbsolute={maxAbsolute}
                currency={currency}
              />
            ))}
          </Card>

          {transactions.length > 0 && (
            <Card>
              <p className="mb-3 text-[13px] font-semibold text-slate-600">
                {transactions.length}{' '}
                {transactions.length === 1
                  ? 'transaction'
                  : 'transactions'}{' '}
                to settle
              </p>
              <div className="flex flex-col gap-3">
                {transactions.map((tx, i) => (
                  <TransactionCard
                    key={i}
                    transaction={tx}
                    currency={currency}
                  />
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
