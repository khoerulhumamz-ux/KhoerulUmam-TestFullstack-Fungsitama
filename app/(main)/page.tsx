import Link from 'next/link';
import { FilePlus2, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getInvoices } from '@/repositories/invoice.repository';

export const dynamic = 'force-dynamic';

type HomeProps = {
  searchParams: { created?: string };
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
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));

export default async function Home({ searchParams }: HomeProps) {
  let invoices = await getInvoices().catch(() => null);

  return (
    <main className="invoice-shell min-h-screen px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Invoice workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              List Invoice
            </h1>
          </div>
          <Button asChild className="gap-2">
            <Link href="/new-invoice">
              <FilePlus2 className="h-4 w-4" />
              Create New Invoice
            </Link>
          </Button>
        </header>

        {searchParams.created === '1' && (
          <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Invoice berhasil dibuat.
          </p>
        )}

        {invoices === null ? (
          <section className="rounded-md border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
            <h2 className="font-semibold">Database belum dapat dihubungi</h2>
            <p className="mt-1">
              Atur <code>DATABASE_URL</code> di file <code>.env</code>, lalu jalankan
              migrasi <code>drizzle/0001_create_invoices.sql</code>.
            </p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-md border border-foreground/15 bg-white">
            <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <ReceiptText className="h-5 w-5 text-primary" />
                <h2 className="font-medium">All invoices</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {invoices.length} invoice{invoices.length === 1 ? '' : 's'}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium tabular-nums">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(invoice.issueDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                      {formatMoney(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-sm bg-muted px-2 py-1 text-xs font-medium">
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/invoices/${invoice.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <p className="font-medium">Belum ada invoice</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Buat invoice pertama untuk mulai mengelola tagihan.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        )}
      </div>
    </main>
  );
}
