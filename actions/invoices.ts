'use server';

import { randomUUID } from 'crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { invoiceItems, invoices } from '@/drizzle/schema';

const invoiceInputSchema = z.object({
  clientName: z.string().trim().min(1, 'Nama klien wajib diisi.').max(255),
  clientAddress: z
    .string()
    .trim()
    .min(1, 'Alamat klien wajib diisi.')
    .max(2000),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal terbit tidak valid.'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal jatuh tempo tidak valid.'),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1, 'Deskripsi item wajib diisi.').max(500),
        quantity: z.coerce.number().int().positive().max(1000000),
        unitPrice: z
          .string()
          .regex(/^\d{1,12}(?:\.\d{1,2})?$/, 'Harga harus angka maksimal 12 digit dengan 2 desimal.'),
      })
    )
    .min(1, 'Tambahkan minimal satu item.'),
});

function toCents(amount: string) {
  const [whole, fraction = ''] = amount.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

function fromCents(amount: number) {
  return `${Math.floor(amount / 100)}.${(amount % 100).toString().padStart(2, '0')}`;
}

export async function createInvoice(
  input: unknown
): Promise<{ error: string } | { id: string }> {
  const parsed = invoiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data invoice tidak valid.' };
  }

  const { clientName, clientAddress, issueDate, dueDate, items } = parsed.data;
  if (new Date(`${dueDate}T00:00:00Z`) < new Date(`${issueDate}T00:00:00Z`)) {
    return { error: 'Tanggal jatuh tempo tidak boleh sebelum tanggal terbit.' };
  }

  const preparedItems = items.map((item) => {
    const unitPriceCents = toCents(item.unitPrice);
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: fromCents(unitPriceCents),
      lineTotal: fromCents(unitPriceCents * item.quantity),
      lineTotalCents: unitPriceCents * item.quantity,
    };
  });
  const totalCents = preparedItems.reduce(
    (total, item) => total + item.lineTotalCents,
    0
  );

  if (
    preparedItems.some(
      (item) => !Number.isSafeInteger(item.lineTotalCents) || item.lineTotalCents > 99999999999999
    ) ||
    !Number.isSafeInteger(totalCents) ||
    totalCents > 99999999999999
  ) {
    return { error: 'Total invoice melebihi batas yang didukung.' };
  }

  const invoiceNumber = `INV-${issueDate.replaceAll('-', '')}-${randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;

  try {
    const invoice = await db.transaction(async (transaction) => {
      const [createdInvoice] = await transaction
        .insert(invoices)
        .values({
          invoiceNumber,
          clientName,
          clientAddress,
          issueDate,
          dueDate,
          totalAmount: fromCents(totalCents),
          status: 'Draft',
        })
        .returning({ id: invoices.id });

      await transaction.insert(invoiceItems).values(
        preparedItems.map(({ lineTotalCents, ...item }) => ({
          invoiceId: createdInvoice.id,
          ...item,
        }))
      );

      return createdInvoice;
    });

    return { id: invoice.id };
  } catch {
    return { error: 'Invoice gagal disimpan. Periksa koneksi database lalu coba lagi.' };
  }
}