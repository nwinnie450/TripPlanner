'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/constants';
import {
  parseImportCsv,
  resolveImportRow,
  buildDedupKey,
  buildExistingDedupKeys,
  type ResolvedImportRow,
} from '@/lib/expenseImport';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

export default function ImportExpensesPage() {
  const { passcode, currentMember } = useTripContext();
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { members, isLoading: membersLoading } = useMembers(passcode);
  const { expenses, mutate } = useExpenses(passcode);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [rows, setRows] = useState<ResolvedImportRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ importedCount: number; skippedCount: number } | null>(null);

  const currency = trip?.currency ?? 'USD';
  const existingKeys = useMemo(() => buildExistingDedupKeys(expenses), [expenses]);

  if (tripLoading || membersLoading) return <LoadingSpinner />;
  if (!trip) return null;

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setSubmitError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const { rows: raw, headerErrors: hErrs } = parseImportCsv(text);
      if (hErrs.length > 0) {
        setHeaderErrors(hErrs);
        setRows([]);
        setSelected(new Set());
        return;
      }
      setHeaderErrors([]);
      const resolved = raw.map((r) => {
        const row = resolveImportRow(r, members);
        row.isDuplicate = existingKeys.has(
          buildDedupKey({ date: row.date, description: row.description, amount: row.amount }),
        );
        return row;
      });
      setRows(resolved);
      // Default-select rows that have no errors and aren't duplicates
      const initial = new Set<number>();
      resolved.forEach((r, i) => {
        if (r.errors.length === 0 && !r.isDuplicate) initial.add(i);
      });
      setSelected(initial);
    };
    reader.readAsText(file);
  }

  function toggleRow(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;
  const errorCount = rows.filter((r) => r.errors.length > 0).length;

  async function handleImport() {
    const toSend = rows
      .filter((_, i) => selected.has(i))
      .map((r) => ({
        amount: r.amount,
        currency: r.currency,
        description: r.description,
        category: r.category,
        expenseType: r.expenseType,
        paidBy: r.paidBy,
        splitBetween: r.splitBetween,
        date: r.date,
      }));
    if (toSend.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/trip/${passcode}/expenses/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy: currentMember?.memberId ?? '',
          expenses: toSend,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult({ importedCount: json.importedCount, skippedCount: json.skippedCount });
        await mutate();
      } else {
        const json = await res.json().catch(() => ({}));
        setSubmitError(json?.message ?? 'Failed to import expenses. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#F5F3FF] via-[#FAF5FF] to-white">
      <div className="relative overflow-hidden flex items-center bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-4 pb-6 pt-12">
        <button
          onClick={() => router.back()}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h1 className="relative ml-3 font-[family-name:var(--font-display)] text-[20px] font-bold text-white">
          Import Expenses 📥
        </h1>
      </div>

      <div className="px-5 -mt-3 pb-10">
        <div className="rounded-[20px] border-t-4 border-dashed border-[#A78BFA] bg-white p-6 shadow-lg">
          {!result && (
            <>
              <p className="mb-4 text-[13px] text-slate-500">
                Upload a CSV with columns: <code className="text-[12px]">Date, Description, Category, Amount, Paid By, Split Between</code>{' '}
                (Split Between values separated by <code className="text-[12px]">;</code>). Names must match trip member names.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 py-10 text-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Upload size={28} />
                <span className="text-[14px] font-bold">
                  {fileName ? fileName : 'Choose a CSV file'}
                </span>
              </button>

              {headerErrors.length > 0 && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
                  {headerErrors.map((e) => <p key={e}>{e}</p>)}
                </div>
              )}

              {rows.length > 0 && (
                <>
                  <div className="mt-5 flex flex-wrap gap-2 text-[12px] font-bold">
                    <span className="rounded-full bg-purple-100 text-purple-700 px-3 py-1">{rows.length} rows</span>
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1">{validCount} valid</span>
                    {duplicateCount > 0 && (
                      <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1">{duplicateCount} duplicate (skipped by default)</span>
                    )}
                    {errorCount > 0 && (
                      <span className="rounded-full bg-red-100 text-red-700 px-3 py-1">{errorCount} need fixing</span>
                    )}
                  </div>

                  <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-slate-100">
                    <table className="w-full text-[12px]">
                      <thead className="sticky top-0 bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-2 py-2 text-left"></th>
                          <th className="px-2 py-2 text-left">Date</th>
                          <th className="px-2 py-2 text-left">Description</th>
                          <th className="px-2 py-2 text-right">Amount</th>
                          <th className="px-2 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className={`border-t border-slate-100 ${r.errors.length > 0 ? 'bg-red-50/50' : r.isDuplicate ? 'bg-amber-50/50' : ''}`}>
                            <td className="px-2 py-2">
                              <input
                                type="checkbox"
                                checked={selected.has(i)}
                                disabled={r.errors.length > 0}
                                onChange={() => toggleRow(i)}
                                className="h-4 w-4 rounded accent-[#8B5CF6]"
                              />
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-slate-600">{r.date}</td>
                            <td className="px-2 py-2 text-slate-900 max-w-[220px] truncate" title={r.description}>{r.description}</td>
                            <td className="px-2 py-2 text-right text-slate-900 whitespace-nowrap">{formatCurrency(r.amount, r.currency ?? currency)}</td>
                            <td className="px-2 py-2">
                              {r.errors.length > 0 ? (
                                <span className="text-red-600" title={r.errors.join('; ')}>{r.errors[0]}</span>
                              ) : r.isDuplicate ? (
                                <span className="text-amber-600">Already in trip</span>
                              ) : (
                                <span className="text-green-600">New</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {submitError && (
                    <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
                      {submitError}
                    </div>
                  )}

                  <Button
                    className="mt-5"
                    onClick={handleImport}
                    disabled={isSubmitting || selected.size === 0}
                  >
                    {isSubmitting ? 'Importing... ✈️' : `Import ${selected.size} expense${selected.size === 1 ? '' : 's'}`}
                  </Button>
                </>
              )}
            </>
          )}

          {result && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="text-[48px]">🎉</span>
              <p className="text-[18px] font-bold text-slate-900">
                Imported {result.importedCount} expense{result.importedCount === 1 ? '' : 's'}
              </p>
              {result.skippedCount > 0 && (
                <p className="text-[13px] text-slate-500">
                  Skipped {result.skippedCount} duplicate{result.skippedCount === 1 ? '' : 's'} already in the trip.
                </p>
              )}
              <Button className="mt-2" onClick={() => router.push(`/trip/${passcode}/expenses`)}>
                Back to Expenses
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
