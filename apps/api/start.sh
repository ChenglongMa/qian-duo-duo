#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."
while ! pg_isready -h db -p 5432 > /dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready — running migrations"
(cd apps/api && npx prisma migrate deploy --schema prisma/schema.prisma --config prisma.config.ts)

# 启动 API
node apps/api/dist/main.js
