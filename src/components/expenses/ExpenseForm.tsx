'use client';

import { useState, useMemo } from 'react';
import type { Expense, ExpenseCategory, ExpenseType, Member } from '@/types';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, formatCurrency } from '@/lib/constants';
import Button from '@/components/ui/Button';
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
        <label className="text-[13px] font-semibold text-slate-600">Expense type</label>
        <div className="flex gap-2">
          {(['group', 'personal'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setExpenseType(type)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                expenseType === type
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {type === 'group' ? 'Group' : 'Personal'}
            </button>
          ))}
        </div>
        {expenseType === 'personal' && (
          <p className="text-[12px] text-slate-400">
            Personal expenses are tracked separately and not included in group budget or settlement.
          </p>
        )}
      </div>

      {/* Amount display */}
      <div className="flex flex-col items-center gap-2 py-4">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent text-center font-[family-name:var(--font-display)] text-[48px] font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none"
        />
        <div className="h-1 w-24 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
        {errors.amount && <p className="text-[13px] text-red-500">{errors.amount}</p>}
      </div>

      <Input
        label="Description *"
        placeholder="e.g., Dinner at restaurant"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />

      {/* Category pills */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-slate-600">Category *</label>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const config = CATEGORY_COLORS[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(isSelected ? '' : cat)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{config.emoji}</span> {cat}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-[13px] text-red-500">{errors.category}</p>}
      </div>

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
          <label className="text-[13px] font-semibold text-slate-600">Split between *</label>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <label
                key={m.memberId}
                className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 transition-colors hover:bg-slate-50"
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
            <p className="text-[13px] font-medium text-[#8B5CF6]">
              Each person: {formatCurrency(perPerson, selectedCurrency)}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSplitBetween(members.map((m) => m.memberId))}
              className="text-[13px] font-medium text-[#8B5CF6]"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setSplitBetween([])}
              className="text-[13px] font-medium text-[#8B5CF6]"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] font-[family-name:var(--font-display)] text-[16px] font-bold text-white shadow-sm transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Expense'}
      </button>
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      {onDelete && (
        <Button type="button" variant="destructive" onClick={onDelete}>
          Delete Expense
        </Button>
      )}
    </form>
  );
}
