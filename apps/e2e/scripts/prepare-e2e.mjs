import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const env = {
  ...process.env,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'CorrectHorse!2026',
  DATABASE_URL:
    process.env.DATABASE_URL ??
    'postgresql://qdd:qdd_dev_password@localhost:15432/qdd_dev?schema=public',
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'e2e-session-secret-change-me'
};

function run(args) {
  const result = spawnSync('pnpm', args, {
    cwd: fileURLToPath(new URL('../../..', import.meta.url)),
    env,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(['--filter', '@qdd/e2e', 'exec', 'playwright', 'install', 'chromium']);
run(['--filter', '@qdd/api', 'db:migrate']);
run(['--filter', '@qdd/api', 'db:seed']);
