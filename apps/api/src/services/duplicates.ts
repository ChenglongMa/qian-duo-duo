import { prisma } from '../prisma.js';

interface DetectInput {
  ledgerId: string;
  amount: number;
  currency: string;
  merchantId?: string;
  dateIso: string;
}

export const detectDuplicates = async ({ ledgerId, amount, currency, merchantId, dateIso }: DetectInput) => {
  const date = new Date(dateIso);
  const windowMs = 5 * 60 * 1000;
  const from = new Date(date.getTime() - windowMs);
  const to = new Date(date.getTime() + windowMs);

  return prisma.entry.findMany({
    where: {
      ledgerId,
      amount,
      currency,
      merchantId: merchantId || undefined,
      date: { gte: from, lte: to }
    },
    orderBy: { date: 'desc' },
    take: 5
  });
};
