import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../prisma';
import { createDefaultCategories } from '../services/defaultCategories';

const ledgerBody = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

const categoryBody = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  parentId: z.string().uuid().optional()
});

export const ledgerRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.get('/', async (request) => {
    const userId = request.user.sub;
    const memberships = await prisma.ledgerMember.findMany({
      where: { userId },
      include: { ledger: true }
    });
    return memberships.map((m) => ({
      id: m.ledger.id,
      name: m.ledger.name,
      description: m.ledger.description,
      role: m.role
    }));
  });

  app.post('/', { schema: { body: ledgerBody } }, async (request) => {
    const userId = request.user.sub;
    const { name, description } = request.body;
    const ledger = await prisma.ledger.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: { create: { userId, role: 'owner' } }
      }
    });
    await createDefaultCategories(ledger.id);
    return ledger;
  });

  app.patch('/:ledgerId', { schema: { body: ledgerBody.partial(), params: z.object({ ledgerId: z.string().uuid() }) } }, async (request, reply) => {
    const { ledgerId } = request.params;
    const { name, description } = request.body;
    const membership = await prisma.ledgerMember.findUnique({
      where: { ledgerId_userId: { ledgerId, userId: request.user.sub } }
    });
    if (!membership) {
      return reply.forbidden('Not a member of this ledger');
    }
    const ledger = await prisma.ledger.update({
      where: { id: ledgerId },
      data: { name, description }
    });
    return ledger;
  });

  app.get('/:ledgerId/categories', { schema: { params: z.object({ ledgerId: z.string().uuid() }) } }, async (request, reply) => {
    const { ledgerId } = request.params;
    const membership = await prisma.ledgerMember.findUnique({
      where: { ledgerId_userId: { ledgerId, userId: request.user.sub } }
    });
    if (!membership) return reply.forbidden('Not a member of this ledger');
    const categories = await prisma.category.findMany({
      where: { ledgerId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }]
    });
    return categories;
  });

  app.post('/:ledgerId/categories', {
    schema: {
      params: z.object({ ledgerId: z.string().uuid() }),
      body: categoryBody
    }
  }, async (request, reply) => {
    const { ledgerId } = request.params;
    const membership = await prisma.ledgerMember.findUnique({
      where: { ledgerId_userId: { ledgerId, userId: request.user.sub } }
    });
    if (!membership) return reply.forbidden('Not a member of this ledger');

    const category = await prisma.category.create({
      data: {
        name: request.body.name,
        type: request.body.type,
        parentId: request.body.parentId,
        ledgerId
      }
    });
    return category;
  });
};
