import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../prisma';
import { buildJwtPayload, hashPassword, verifyPassword } from '../auth';
import { createDefaultCategories } from '../services/defaultCategories';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  mainCurrency: z.string().min(3).max(3)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8)
});

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post('/register', {
    schema: {
      body: registerSchema
    }
  }, async (request, reply) => {
    const { email, password, name, mainCurrency } = request.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.badRequest('Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        mainCurrency
      }
    });

    // Create a default ledger and categories
    const ledger = await prisma.ledger.create({
      data: {
        name: '默认账本',
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner'
          }
        }
      }
    });
    await createDefaultCategories(ledger.id);

    const token = app.jwt.sign(buildJwtPayload(user));
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mainCurrency: user.mainCurrency
      },
      defaultLedgerId: ledger.id
    };
  });

  app.post('/login', {
    schema: {
      body: loginSchema
    }
  }, async (request, reply) => {
    const { email, password } = request.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.unauthorized('Invalid credentials');
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return reply.unauthorized('Invalid credentials');
    }
    const membership = await prisma.ledgerMember.findFirst({
      where: { userId: user.id },
      select: { ledgerId: true }
    });
    const token = app.jwt.sign(buildJwtPayload(user));
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mainCurrency: user.mainCurrency
      },
      defaultLedgerId: membership?.ledgerId ?? null
    };
  });

  app.post('/change-password', {
    schema: {
      body: changePasswordSchema
    }
  }, async (request, reply) => {
    await app.authenticate(request, reply);
    const { currentPassword, newPassword } = request.body;
    const user = await prisma.user.findUnique({ where: { id: request.user.sub } });
    if (!user) return reply.unauthorized();
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return reply.unauthorized('Current password is incorrect');
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return { success: true };
  });
};
