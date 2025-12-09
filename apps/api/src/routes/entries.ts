import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { detectDuplicates } from '../services/duplicates.js';
import { getFxRate } from '../services/fx.js';

const entryBody = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  date: z.string(),
  categoryId: z.uuid().nullable().optional(),
  subcategoryId: z.uuid().nullable().optional(),
  projectId: z.uuid().nullable().optional(),
  merchantId: z.uuid().nullable().optional(),
  member: z.string().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  fxRate: z.number().optional()
});

const listQuery = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.uuid().optional(),
  projectId: z.uuid().optional(),
  merchantId: z.uuid().optional(),
  type: z.enum(['income', 'expense']).optional(),
  status: z.enum(['normal', 'pending_review']).optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
  cursor: z.uuid().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const entryRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.get('/', {
    schema: {
      params: z.object({ ledgerId: z.uuid() }),
      querystring: listQuery
    }
  }, async (request, reply) => {
    const { ledgerId } = request.params;
    const membership = await prisma.ledgerMember.findUnique({
      where: { ledgerId_userId: { ledgerId, userId: request.user.sub } }
    });
    if (!membership) return reply.forbidden('Not a member of this ledger');

    const {
      startDate,
      endDate,
      categoryId,
      projectId,
      merchantId,
      type,
      status,
      limit = 50,
      cursor,
      sortBy = 'date',
      sortOrder = 'desc'
    } = request.query;

    const entries = await prisma.entry.findMany({
      where: {
        ledgerId,
        ...(startDate || endDate
          ? {
              date: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
              }
            }
          : {}),
        categoryId,
        projectId,
        merchantId,
        type,
        status
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        category: true,
        subcategory: true,
        merchant: true,
        project: true
      }
    });

    return entries;
  });

  app.post('/', {
    schema: {
      params: z.object({ ledgerId: z.uuid() }),
      body: entryBody
    }
  }, async (request, reply) => {
    const { ledgerId } = request.params;
    const userId = request.user.sub;
    const membership = await prisma.ledgerMember.findUnique({
      where: { ledgerId_userId: { ledgerId, userId } }
    });
    if (!membership) return reply.forbidden('Not a member of this ledger');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.unauthorized();

    const fxRate = await getFxRate({
      base: request.body.currency,
      quote: user.mainCurrency,
      explicit: request.body.fxRate
    });

    const amountMain = Number((request.body.amount * fxRate).toFixed(2));

    const duplicates = await detectDuplicates({
      ledgerId,
      amount: request.body.amount,
      currency: request.body.currency,
      merchantId: request.body.merchantId || undefined,
      dateIso: request.body.date
    });

    const status = duplicates.length > 0 ? 'pending_review' : 'normal';

    const entry = await prisma.entry.create({
      data: {
        ledgerId,
        type: request.body.type,
        amount: request.body.amount,
        currency: request.body.currency,
        amountMain,
        fxRate,
        categoryId: request.body.categoryId || undefined,
        subcategoryId: request.body.subcategoryId || undefined,
        projectId: request.body.projectId || undefined,
        merchantId: request.body.merchantId || undefined,
        member: request.body.member || undefined,
        date: new Date(request.body.date),
        note: request.body.note || undefined,
        status,
        duplicateOf: duplicates[0]?.id
      }
    });

    return { entry, duplicates };
  });

  app.patch('/:entryId', {
    schema: {
      params: z.object({ ledgerId: z.uuid(), entryId: z.uuid() }),
      body: entryBody.partial()
    }
  }, async (request, reply) => {
    const { ledgerId, entryId } = request.params;
    const membership = await prisma.ledgerMember.findUnique({
      where: { ledgerId_userId: { ledgerId, userId: request.user.sub } }
    });
    if (!membership) return reply.forbidden('Not a member of this ledger');

    const existing = await prisma.entry.findFirst({ where: { id: entryId, ledgerId } });
    if (!existing) return reply.notFound('Entry not found');

    const data: any = { ...request.body };
    if (data.fxRate) delete data.fxRate;
    if (data.date) data.date = new Date(data.date);

    const entry = await prisma.entry.update({ where: { id: entryId }, data });
    return entry;
  });

  app.delete('/:entryId', {
    schema: {
      params: z.object({ ledgerId: z.uuid(), entryId: z.uuid() })
    }
  }, async (request, reply) => {
    const { ledgerId, entryId } = request.params;
    const membership = await prisma.ledgerMember.findUnique({
      where: { ledgerId_userId: { ledgerId, userId: request.user.sub } }
    });
    if (!membership) return reply.forbidden('Not a member of this ledger');

    const existing = await prisma.entry.findFirst({ where: { id: entryId, ledgerId } });
    if (!existing) return reply.notFound();

    await prisma.entry.delete({ where: { id: entryId } });
    return reply.status(204).send();
  });
};
