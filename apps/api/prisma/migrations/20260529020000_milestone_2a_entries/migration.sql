CREATE TABLE "entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ledger_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "original_amount" NUMERIC(18, 4) NOT NULL,
  "original_currency" TEXT NOT NULL,
  "fx_rate" NUMERIC(18, 8) NOT NULL,
  "base_amount" NUMERIC(18, 4) NOT NULL,
  "base_currency" TEXT NOT NULL,
  "category_id" UUID,
  "member_id" UUID,
  "merchant_id" UUID,
  "project_id" UUID,
  "note" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ(3),
  CONSTRAINT "entries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "entries_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "entries_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "entries_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "entries_type_check" CHECK ("type" IN ('Expense', 'Income')),
  CONSTRAINT "entries_original_amount_check" CHECK ("original_amount" > 0),
  CONSTRAINT "entries_fx_rate_check" CHECK ("fx_rate" > 0),
  CONSTRAINT "entries_base_amount_check" CHECK ("base_amount" >= 0)
);

CREATE INDEX "entries_ledger_id_occurred_at_idx" ON "entries"("ledger_id", "occurred_at");
CREATE INDEX "entries_ledger_id_deleted_at_idx" ON "entries"("ledger_id", "deleted_at");
CREATE INDEX "entries_ledger_id_type_idx" ON "entries"("ledger_id", "type");
CREATE INDEX "entries_ledger_id_category_id_idx" ON "entries"("ledger_id", "category_id");
CREATE INDEX "entries_ledger_id_member_id_idx" ON "entries"("ledger_id", "member_id");
CREATE INDEX "entries_ledger_id_merchant_id_idx" ON "entries"("ledger_id", "merchant_id");
CREATE INDEX "entries_ledger_id_project_id_idx" ON "entries"("ledger_id", "project_id");
