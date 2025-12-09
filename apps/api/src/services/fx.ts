import { prisma } from '../prisma.js';

export const getFxRate = async ({ base, quote, explicit }: { base: string; quote: string; explicit?: number }) => {
  if (typeof explicit === 'number') return explicit;
  if (base === quote) return 1;
  const rate = await prisma.fxRate.findFirst({
    where: { base, quote },
    orderBy: { asOf: 'desc' }
  });
  if (!rate) {
    throw new Error(`No FX rate for ${base}->${quote}`);
  }
  return Number(rate.rate);
};
