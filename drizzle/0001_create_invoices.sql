CREATE TABLE IF NOT EXISTS "invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoice_number" varchar(40) NOT NULL UNIQUE,
  "client_name" varchar(255) NOT NULL,
  "client_address" varchar(2000) NOT NULL,
  "issue_date" date NOT NULL,
  "due_date" date NOT NULL,
  "total_amount" numeric(14, 2) NOT NULL CHECK ("total_amount" >= 0),
  "status" varchar(24) NOT NULL DEFAULT 'Draft',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "invoice_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "description" varchar(500) NOT NULL,
  "quantity" integer NOT NULL CHECK ("quantity" > 0),
  "unit_price" numeric(14, 2) NOT NULL CHECK ("unit_price" > 0),
  "line_total" numeric(14, 2) NOT NULL CHECK ("line_total" >= 0)
);