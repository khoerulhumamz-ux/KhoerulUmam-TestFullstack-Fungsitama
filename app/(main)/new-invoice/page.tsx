import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/components/invoices/invoice-form';

export default function NewInvoicePage() {
  return (
    <main className="invoice-shell min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="mb-6 -ml-3 gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to invoices
          </Link>
        </Button>
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            New document
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Create Invoice</h1>
        </div>
        <InvoiceForm />
      </div>
    </main>
  );
}