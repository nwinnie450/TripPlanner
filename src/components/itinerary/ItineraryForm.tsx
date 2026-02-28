'use client';

import { useState } from 'react';
import type { ItineraryItem } from '@/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface ItineraryFormProps {
  dates: string[];
  initialData?: Partial<ItineraryItem>;
  onSubmit: (data: {
    dayDate: string;
    title: string;
    time: string;
    location: string;
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

export default function ItineraryForm({
  dates,
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
}: ItineraryFormProps) {
  const [dayDate, setDayDate] = useState(initialData?.dayDate ?? dates[0] ?? '');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [time, setTime] = useState(initialData?.time ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!dayDate) errs.dayDate = 'Day is required';
    if (!title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ dayDate, title: title.trim(), time, location: location.trim(), notes: notes.trim() });
  }

  const dateOptions = dates.map((d) => ({ value: d, label: formatDate(d) }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Day *"
        options={dateOptions}
        value={dayDate}
        onChange={(e) => setDayDate(e.target.value)}
        error={errors.dayDate}
      />
      <Input
        label="Title *"
        placeholder="e.g., Visit Sagrada Familia"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />
      <Input
        label="Time"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <Input
        label="Location"
        placeholder="e.g., Carrer de Mallorca"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="notes"
          className="text-[13px] font-semibold text-slate-600"
        >
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-[10px] border border-sand-dark bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Activity'}
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      {onDelete && (
        <Button type="button" variant="destructive" onClick={onDelete}>
          Delete Activity
        </Button>
      )}
    </form>
  );
}
