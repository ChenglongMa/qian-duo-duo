import dotenv from 'dotenv';

dotenv.config();

const number = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: number(process.env.API_PORT, 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/qianduoduo',
  rateLimit: number(process.env.RATE_LIMIT, 200),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
