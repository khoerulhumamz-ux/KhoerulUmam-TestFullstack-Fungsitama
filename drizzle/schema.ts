import { sql } from 'drizzle-orm';
import {
  check,
  date,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: varchar('invoice_number', { length: 40 }).notNull().unique(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientAddress: varchar('client_address', { length: 2000 }).notNull(),
  issueDate: date('issue_date', { mode: 'string' }).notNull(),
  dueDate: date('due_date', { mode: 'string' }).notNull(),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
  status: varchar('status', { length: 24 }).notNull().default('Draft'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [check('invoices_total_nonnegative', sql`${table.totalAmount} >= 0`)]);

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 500 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 14, scale: 2 }).notNull(),
  lineTotal: numeric('line_total', { precision: 14, scale: 2 }).notNull(),
}, (table) => [
  check('invoice_items_quantity_positive', sql`${table.quantity} > 0`),
  check('invoice_items_unit_price_positive', sql`${table.unitPrice} > 0`),
  check('invoice_items_line_total_nonnegative', sql`${table.lineTotal} >= 0`),
]);
