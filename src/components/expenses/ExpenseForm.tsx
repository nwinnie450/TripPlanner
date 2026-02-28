'use client';

import { useState, useMemo } from 'react';
import type { Expense, ExpenseCategory, Member } from '@/types';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface ExpenseFormProps {
  members: Member[];
  currency: string;
  initialData?: Partial<Expense>;
  onSubmit: (data: {
    amount: number;
    description: string;
    category: ExpenseCategory;
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
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [category, setCategory] = useState<string>(
    initialData?.category ?? '',
  );
  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().split('T')[0],
  );
  const [paidBy, setPaidBy] = useState(initialData?.paidBy ?? '');
  const [splitBetween, setSplitBetween] = useState<string[]>(
    initialData?.splitBetween ?? members.map((m) => m.memberId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const perPerson = useMemo(() => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || splitBetween.length === 0) return 0;
    return amt / splitBetween.length;
  }, [amount, splitBetween]);

  function toggleMember(memberId: string) {
    setSplitBetween((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
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
    if (splitBetween.length === 0)
      errs.splitBetween = 'Select at least one person';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      description: description.trim(),
      category: category as ExpenseCategory,
      date,
      paidBy,
      splitBetween,
    });
  }

  const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({
    value: c,
    label: c,
  }));
  const memberOptions = members.map((m) => ({
    value: m.memberId,
    label: m.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-semibold text-slate-600">
          Amount *
        </label>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`h-14 w-full rounded-[10px] border bg-white px-4 text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean ${errors.amount ? 'border-red' : 'border-sand-dark'}`}
        />
        {errors.amount && (
          <p className="text-[13px] text-red">{errors.amount}</p>
        )}
      </div>

      <Input
        label="Description *"
        placeholder="e.g., Dinner at restaurant"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />

      <Select
        label="Category *"
        options={categoryOptions}
        placeholder="Select category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        error={errors.category}
      />

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

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-slate-600">
          Split between *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {members.map((m) => (
            <label
              key={m.memberId}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-sand-dark px-3"
            >
              <input
                type="checkbox"
                checked={splitBetween.includes(m.memberId)}
                onChange={() => toggleMember(m.memberId)}
                className="h-4 w-4 accent-ocean"
              />
              <span className="text-[15px] text-slate-900">{m.name}</span>
            </label>
          ))}
        </div>
        {errors.splitBetween && (
          <p className="text-[13px] text-red">{errors.splitBetween}</p>
        )}
        {perPerson > 0 && (
          <p className="text-[13px] font-medium text-ocean">
            Each person: {formatCurrency(perPerson, currency)}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setSplitBetween(members.map((m) => m.memberId))
            }
            className="text-[13px] font-medium text-ocean"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => setSplitBetween([])}
            className="text-[13px] font-medium text-ocean"
          >
            Deselect All
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Expense'}
      </Button>
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
