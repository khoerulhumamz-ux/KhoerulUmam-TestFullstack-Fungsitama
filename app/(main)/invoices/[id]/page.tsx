import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PrintButton } from '@/components/invoices/print-button';
import { getInvoiceById } from '@/repositories/invoice.repository';

export const dynamic = 'force-dynamic';

type InvoicePageProps = {
  params: { id: string };
};

const formatMoney = (value: string) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
  }).format(Number(value));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));

export default async function InvoiceDetailPage({ params }: InvoicePageProps) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id)) {
    notFound();
  }

  const invoice = await getInvoiceById(params.id).catch(() => null);
  if (!invoice) notFound();

  return (
    <main className="invoice-shell min-h-screen px-4 py-8 sm:px-8 lg:px-12 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="-ml-3 gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to invoices
            </Link>
          </Button>
          <PrintButton />
        </div>

        <article className="print-paper rounded-md border border-foreground/15 bg-white p-5 sm:p-9 print:border-0 print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-foreground/15 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground print:text-foreground">
                Invoice
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {invoice.invoiceNumber}
              </h1>
            </div>
            <span className="rounded-sm bg-foreground px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white print:border print:border-foreground print:bg-white print:text-foreground">
              {invoice.status}
            </span>
          </div>

          <div className="grid gap-7 py-7 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground print:text-foreground">
                Bill To
              </p>
              <h2 className="font-semibold">{invoice.clientName}</h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted-foreground print:text-foreground">
                {invoice.clientAddress}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:justify-self-end sm:min-w-64">
              <dt className="text-muted-foreground print:text-foreground">Invoice Date</dt>
              <dd className="text-right font-medium">{formatDate(invoice.issueDate)}</dd>
              <dt className="text-muted-foreground print:text-foreground">Due Date</dt>
              <dd className="text-right font-medium">{formatDate(invoice.dueDate)}</dd>
            </dl>
          </div>

          <Table className="invoice-items-table">
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60 print:bg-gray-100">
                <TableHead className="w-full">Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="whitespace-nowrap text-right">Unit Price</TableHead>
                <TableHead className="whitespace-nowrap text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums">
                    {formatMoney(item.unitPrice)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                    {formatMoney(item.lineTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="ml-auto mt-6 w-full max-w-xs border-t border-foreground/15 pt-4">
            <div className="flex items-center justify-between gap-4 text-base font-semibold">
              <span>Total Amount</span>
              <span className="whitespace-nowrap tabular-nums">
                {formatMoney(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}