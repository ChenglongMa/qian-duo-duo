CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE "admin_accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "singleton_key" TEXT NOT NULL DEFAULT 'single_admin',
  "username" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_accounts_singleton_key_key" ON "admin_accounts"("singleton_key");
CREATE UNIQUE INDEX "admin_accounts_username_key" ON "admin_accounts"("username");

CREATE TABLE "admin_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "admin_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "csrf_token_hash" TEXT NOT NULL,
  "user_agent" TEXT,
  "ip_address" TEXT,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "revoked_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "admin_sessions_token_hash_key" ON "admin_sessions"("token_hash");
CREATE INDEX "admin_sessions_admin_id_idx" ON "admin_sessions"("admin_id");
CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions"("expires_at");

CREATE TABLE "ledgers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "base_currency" TEXT NOT NULL,
  "timezone" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ(3),
  CONSTRAINT "ledgers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ledgers_deleted_at_idx" ON "ledgers"("deleted_at");

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ledger_id" UUID NOT NULL,
  "stable_key" TEXT NOT NULL,
  "parent_id" UUID,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ(3),
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "categories_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "categories_ledger_id_stable_key_key" ON "categories"("ledger_id", "stable_key");
CREATE INDEX "categories_ledger_id_parent_id_idx" ON "categories"("ledger_id", "parent_id");
CREATE INDEX "categories_ledger_id_deleted_at_idx" ON "categories"("ledger_id", "deleted_at");

CREATE TABLE "category_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ledger_id" UUID NOT NULL,
  "version_number" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actor_id" UUID,
  "actor_label" TEXT NOT NULL,
  "request_id" TEXT NOT NULL,
  CONSTRAINT "category_versions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "category_versions_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "category_versions_ledger_id_version_number_key" ON "category_versions"("ledger_id", "version_number");
CREATE INDEX "category_versions_ledger_id_created_at_idx" ON "category_versions"("ledger_id", "created_at");

CREATE TABLE "members" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ledger_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ(3),
  CONSTRAINT "members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "members_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "members_ledger_id_name_key" ON "members"("ledger_id", "name");
CREATE INDEX "members_ledger_id_deleted_at_idx" ON "members"("ledger_id", "deleted_at");

CREATE TABLE "projects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ledger_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ(3),
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "projects_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "projects_ledger_id_name_key" ON "projects"("ledger_id", "name");
CREATE INDEX "projects_ledger_id_deleted_at_idx" ON "projects"("ledger_id", "deleted_at");

CREATE TABLE "merchants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ledger_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "normalized_name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deleted_at" TIMESTAMPTZ(3),
  CONSTRAINT "merchants_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "merchants_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "merchants_ledger_id_normalized_name_key" ON "merchants"("ledger_id", "normalized_name");
CREATE INDEX "merchants_ledger_id_deleted_at_idx" ON "merchants"("ledger_id", "deleted_at");
CREATE INDEX "merchants_normalized_name_trgm_idx" ON "merchants" USING GIN ("normalized_name" gin_trgm_ops);

CREATE TABLE "rule_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ledger_id" UUID NOT NULL,
  "rule_type" TEXT NOT NULL,
  "version_number" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "snapshot" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rule_versions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "rule_versions_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "rule_versions_ledger_id_rule_type_version_number_key" ON "rule_versions"("ledger_id", "rule_type", "version_number");
CREATE INDEX "rule_versions_ledger_id_rule_type_active_idx" ON "rule_versions"("ledger_id", "rule_type", "active");

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID,
  "actor_label" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "ledger_id" UUID,
  "metadata" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "request_id" TEXT NOT NULL,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_logs_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "audit_logs_ledger_id_created_at_idx" ON "audit_logs"("ledger_id", "created_at");
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");
