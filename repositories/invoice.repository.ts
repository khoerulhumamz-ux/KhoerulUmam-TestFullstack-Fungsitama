import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { invoiceItems, invoices } from '@/drizzle/schema';

export async function getInvoices() {
  return db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) return null;

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id));

  return { ...invoice, items };
}