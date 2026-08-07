import type { Metadata } from 'next';
import { RepairForm } from '@/components/repair/RepairForm';

export const metadata: Metadata = {
  title: 'Book a Repair',
  description: 'Submit a repair request for your mobile or laptop at Patron Electronics.',
};

export default function RepairPage() {
  return (
    <div className="container max-w-2xl py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">Book a Repair</h1>
      <p className="text-muted mt-1 text-sm">
        Tell us about your device and the issue you&rsquo;re facing. No account needed.
      </p>

      <div className="mt-8">
        <RepairForm />
      </div>
    </div>
  );
}
