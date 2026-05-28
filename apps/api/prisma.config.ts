import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const DEFAULT_LOCAL_DATABASE_URL =
  'postgresql://qdd:qdd_dev_password@localhost:15432/qdd_dev?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_LOCAL_DATABASE_URL
  }
});
