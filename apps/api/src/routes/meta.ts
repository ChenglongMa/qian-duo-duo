import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../prisma.js';

export const metaRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/fx', {
    schema: {
      querystring: z.object({
        base: z.string().length(3),
        quote: z.string().length(3)
      })
    }
  }, async (request, reply) => {
    const { base, quote } = request.query;
    if (base === quote) return { rate: 1 };
    const rate = await prisma.fxRate.findFirst({
      where: { base, quote },
      orderBy: { asOf: 'desc' }
    });
    if (!rate) return reply.notFound('No FX rate available');
    return { rate: Number(rate.rate), asOf: rate.asOf };
  });

  app.post('/fx', {
    schema: {
      body: z.object({
        base: z.string().length(3),
        quote: z.string().length(3),
        rate: z.number().positive(),
        asOf: z.string().optional()
      })
    }
  }, async (request) => {
    const { base, quote, rate, asOf } = request.body;
    const saved = await prisma.fxRate.create({
      data: {
        base,
        quote,
        rate,
        asOf: asOf ? new Date(asOf) : new Date()
      }
    });
    return saved;
  });

  app.post('/llm/categorize', {
    schema: {
      body: z.object({
        merchant: z.string().optional(),
        note: z.string().optional(),
        amount: z.number().optional()
      })
    }
  }, async (request) => {
    // Very simple rule-based guess; real LLM call can be integrated here.
    const merchant = request.body.merchant?.toLowerCase() || '';
    let category: { name: string; type: 'expense' | 'income' } | null = null;
    if (merchant.includes('ikea')) category = { name: '家居用品', type: 'expense' };
    if (merchant.includes('coles') || merchant.includes('supermarket')) category = { name: '食品杂货', type: 'expense' };
    if (merchant.includes('uber') || merchant.includes('taxi')) category = { name: '交通', type: 'expense' };
    if (merchant.includes('salary')) category = { name: '工资', type: 'income' };
    return {
      category,
      confidence: category ? 0.75 : 0.4,
      usedLLM: false
    };
  });
};
