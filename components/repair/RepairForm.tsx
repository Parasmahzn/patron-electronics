'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { submitRepairRequestAction } from '@/app/actions/repair';

const DEVICE_TYPES = ['Mobile', 'Laptop', 'Tablet', 'Other'];

export function RepairForm() {
  const [state, action, pending] = useActionState(submitRepairRequestAction, undefined);

  if (state?.requestNumber) {
    return (
      <div className="border-border flex flex-col items-center rounded-lg border bg-white p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 aria-hidden="true" className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="font-heading text-midnight mt-5 text-xl font-bold">
          Repair request received!
        </h2>
        <p className="text-muted mt-2 max-w-md text-sm">
          Our technicians will review your request and contact you shortly to confirm the diagnosis
          and next steps.
        </p>
        <div className="border-border bg-surface mt-5 rounded-lg border px-6 py-4">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">Request Number</p>
          <p className="font-heading text-primary mt-1 text-lg font-bold">{state.requestNumber}</p>
        </div>
        <Link href="/" className="mt-6">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="border-border flex flex-col gap-4 rounded-lg border bg-white p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          name="name"
          required
          autoComplete="name"
          placeholder="Your full name"
        />
        <Input label="Phone" name="phone" required autoComplete="tel" placeholder="98XXXXXXXX" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Device Type" name="deviceType" required defaultValue="">
          <option value="" disabled>
            Select device type
          </option>
          {DEVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Input label="Brand" name="brand" required placeholder="e.g. Samsung, Apple" />
        <Input label="Model" name="model" required placeholder="e.g. Galaxy S24" />
      </div>

      <Textarea
        label="Problem"
        name="problem"
        required
        placeholder="Describe the issue in detail (e.g. cracked screen, won't charge, battery drains fast)"
      />
      <Textarea
        label="Additional Notes (optional)"
        name="notes"
        placeholder="Anything else we should know?"
      />

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-fit">
        <Wrench aria-hidden="true" className="h-4 w-4" />
        {pending ? 'Submitting...' : 'Submit Repair Request'}
      </Button>
    </form>
  );
}
