'use client';

import { useState, useMemo } from 'react';
import type { Expense, ExpenseCategory, ExpenseType, Member } from '@/types';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, formatCurrency } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import CurrencyToggle from '@/components/expenses/CurrencyToggle';

interface ExpenseFormProps {
  members: Member[];
  currency: string;
  currencies?: string[];
  initialData?: Partial<Expense>;
  defaultValues?: {
    description?: string;
    category?: ExpenseCategory;
    date?: string;
  };
  onSubmit: (data: {
    amount: number;
    currency: string;
    description: string;
    category: ExpenseCategory;
    expenseType: ExpenseType;
    date: string;
    paidBy: string;
    splitBetween: string[];
  }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

export default function ExpenseForm({
  members,
  currency,
  currencies,
  initialData,
  defaultValues,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? defaultValues?.description ?? '',
  );
  const [category, setCategory] = useState<string>(
    initialData?.category ?? defaultValues?.category ?? '',
  );
  const [date, setDate] = useState(
    initialData?.date ?? (defaultValues?.date || new Date().toISOString().split('T')[0]),
  );
  const [paidBy, setPaidBy] = useState(initialData?.paidBy ?? '');
  const [splitBetween, setSplitBetween] = useState<string[]>(
    initialData?.splitBetween ?? members.map((m) => m.memberId),
  );
  const [expenseType, setExpenseType] = useState<ExpenseType>(
    initialData?.expenseType ?? 'group',
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    initialData?.currency ?? currencies?.[0] ?? currency,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const perPerson = useMemo(() => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || splitBetween.length === 0) return 0;
    return amt / splitBetween.length;
  }, [amount, splitBetween]);

  function toggleMember(memberId: string) {
    setSplitBetween((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  }

  function validate() {
    const errs: Record<string, string> = {};
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid positive amount';
    if (!description.trim()) errs.description = 'Description is required';
    if (!category) errs.category = 'Category is required';
    if (!date) errs.date = 'Date is required';
    if (!paidBy) errs.paidBy = 'Select who paid';
    if (expenseType === 'group' && splitBetween.length === 0)
      errs.splitBetween = 'Select at least one person';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      currency: selectedCurrency,
      description: description.trim(),
      category: category as ExpenseCategory,
      expenseType,
      date,
      paidBy,
      splitBetween: expenseType === 'personal' ? [paidBy] : splitBetween,
    });
  }

  const displayAmount = amount
    ? formatCurrency(parseFloat(amount) || 0, selectedCurrency)
    : formatCurrency(0, selectedCurrency);

  const memberOptions = members.map((m) => ({
    value: m.memberId,
    label: m.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Currency toggle */}
      {currencies && currencies.length > 1 && (
        <CurrencyToggle
          currencies={currencies}
          selected={selectedCurrency}
          onChange={setSelectedCurrency}
        />
      )}

      {/* Expense type toggle */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Expense type</label>
        <div className="flex gap-2">
          {(['group', 'personal'] as const).map((type) => {
            const typeEmoji = type === 'group' ? '👥' : '🙋';
            return (
              <button
                key={type}
                type="button"
                onClick={() => setExpenseType(type)}
                className={`rounded-full px-5 py-2.5 text-[13px] font-bold transition-all ${
                  expenseType === type
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md scale-105'
                    : 'bg-purple-50 text-slate-500 border border-purple-100 hover:bg-purple-100'
                }`}
              >
                {typeEmoji} {type === 'group' ? 'Group' : 'Personal'}
              </button>
            );
          })}
        </div>
        {expenseType === 'personal' && (
          <p className="text-[12px] text-slate-400 italic">
            Personal expenses are tracked separately and not included in group budget or settlement.
          </p>
        )}
      </div>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-purple-200" />

      {/* Amount display */}
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-purple-50 to-white py-6">
        <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Amount</p>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent text-center font-[family-name:var(--font-display)] text-[48px] font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none"
        />
        <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#C4B5FD]" />
        {errors.amount && <p className="text-[13px] text-red-500">{errors.amount}</p>}
      </div>

      <Input
        label="Description *"
        placeholder="e.g., Dinner at restaurant 🍽️"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />

      {/* Category pills */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Category *</label>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const config = CATEGORY_COLORS[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(isSelected ? '' : cat)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md scale-105'
                    : 'border border-slate-200 bg-white text-slate-500 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <span className="text-[15px]">{config.emoji}</span> {cat}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-[13px] text-red-500">{errors.category}</p>}
      </div>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-purple-200" />

      <Input
        label="Date *"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />

      <Select
        label="Who paid? *"
        options={memberOptions}
        placeholder="Select member"
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        error={errors.paidBy}
      />

      {/* Split between with purple checkboxes — only for group expenses */}
      {expenseType === 'group' && (
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Split between *</label>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <label
                key={m.memberId}
                className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-2xl border px-3 transition-all ${
                  splitBetween.includes(m.memberId)
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={splitBetween.includes(m.memberId)}
                  onChange={() => toggleMember(m.memberId)}
                  className="h-4 w-4 rounded accent-[#8B5CF6]"
                />
                <span className="text-[15px] text-slate-900">{m.name}</span>
              </label>
            ))}
          </div>
          {errors.splitBetween && <p className="text-[13px] text-red-500">{errors.splitBetween}</p>}
          {perPerson > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-2">
              <span className="text-[14px]">💰</span>
              <p className="text-[13px] font-bold text-[#7C3AED]">
                Each person: {formatCurrency(perPerson, selectedCurrency)}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSplitBetween(members.map((m) => m.memberId))}
              className="text-[13px] font-bold text-[#8B5CF6] hover:text-[#7C3AED]"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setSplitBetween([])}
              className="text-[13px] font-bold text-[#8B5CF6] hover:text-[#7C3AED]"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Dashed divider */}
      <div className="border-t border-dashed border-purple-200" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-14 w-full rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] font-[family-name:var(--font-display)] text-[16px] font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? 'Saving... ✈️' : 'Save Expense 🎉'}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl border border-red-200 bg-red-50 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-100 transition-colors"
        >
          🗑️ Delete this expense
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="text-[13px] font-medium text-slate-400 hover:text-slate-600"
      >
        Cancel
      </button>
    </form>
  );
}
