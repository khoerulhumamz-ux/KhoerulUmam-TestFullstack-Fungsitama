'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { createInvoice } from '@/actions/invoices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type InvoiceLine = {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

function dateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function newLine(): InvoiceLine {
  return { key: crypto.randomUUID(), description: '', quantity: '1', unitPrice: '' };
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function InvoiceForm() {
  const router = useRouter();
  const today = dateInputValue(new Date());
  const defaultDue = new Date(`${today}T00:00:00`);
  defaultDue.setDate(defaultDue.getDate() + 30);
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(dateInputValue(defaultDue));
  const [items, setItems] = useState<InvoiceLine[]>([newLine()]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const total = items.reduce((sum, item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    return sum + (Number.isFinite(quantity * unitPrice) ? quantity * unitPrice : 0);
  }, 0);

  function updateItem(key: string, field: keyof Omit<InvoiceLine, 'key'>, value: string) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  }

  function submitInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      clientName: formData.get('clientName'),
      clientAddress: formData.get('clientAddress'),
      issueDate,
      dueDate,
      items: items.map(({ description, quantity, unitPrice }) => ({
        description,
        quantity,
        unitPrice,
      })),
    };

    startTransition(async () => {
      const result = await createInvoice(payload);
      if ('error' in result) {
        setError(result.error ?? 'Invoice gagal disimpan.');
        return;
      }
      router.push('/?created=1');
      router.refresh();
    });
  }

  return (
    <form onSubmit={submitInvoice} className="space-y-6">
      <section className="rounded-md border border-foreground/15 bg-white p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Invoice details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Nomor invoice dibuat otomatis saat disimpan.</p>
          </div>
          <span className="rounded-sm bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Draft
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Client Name <span className="text-destructive">*</span>
            <Input name="clientName" required maxLength={255} placeholder="Nama perusahaan atau klien" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Issue Date <span className="text-destructive">*</span>
            <Input
              type="date"
              required
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            Client Address <span className="text-destructive">*</span>
            <Textarea
              name="clientAddress"
              required
              maxLength={2000}
              rows={3}
              placeholder="Alamat lengkap klien"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Due Date <span className="text-destructive">*</span>
            <Input
              type="date"
              required
              min={issueDate}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 bg-white p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Items</h2>
            <p className="mt-1 text-sm text-muted-foreground">Masukkan rincian barang atau jasa.</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setItems((current) => [...current, newLine()])}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          <div className="hidden grid-cols-[minmax(0,1fr)_100px_180px_40px] gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Description</span><span>Qty</span><span>Unit Price</span><span />
          </div>
          {items.map((item, index) => (
            <div key={item.key} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[minmax(0,1fr)_100px_180px_40px] sm:items-center sm:border-0 sm:p-0">
              <label className="space-y-1 text-xs font-medium text-muted-foreground sm:text-sm sm:text-foreground">
                <span className="sm:hidden">Description</span>
                <Input
                  aria-label={`Description for item ${index + 1}`}
                  required
                  maxLength={500}
                  value={item.description}
                  placeholder="Deskripsi item"
                  onChange={(event) => updateItem(item.key, 'description', event.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-muted-foreground sm:text-sm sm:text-foreground">
                <span className="sm:hidden">Qty</span>
                <Input
                  aria-label={`Quantity for item ${index + 1}`}
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(item.key, 'quantity', event.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-muted-foreground sm:text-sm sm:text-foreground">
                <span className="sm:hidden">Unit Price (IDR)</span>
                <Input
                  aria-label={`Unit price for item ${index + 1}`}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.unitPrice}
                  placeholder="0"
                  onChange={(event) => updateItem(item.key, 'unitPrice', event.target.value)}
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete item ${index + 1}`}
                title="Delete item"
                disabled={items.length === 1}
                onClick={() => setItems((current) => current.filter((line) => line.key !== item.key))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-foreground/10 pt-5">
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Subtotal</span><span className="tabular-nums">{formatMoney(total)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-base font-semibold">
              <span>Total Amount</span><span className="tabular-nums">{formatMoney(total)}</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button asChild type="button" variant="outline">
          <a href="/">Cancel</a>
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-40">
          {isPending ? 'Saving...' : 'Generate Invoice'}
        </Button>
      </div>
    </form>
  );
}