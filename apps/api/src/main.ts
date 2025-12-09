import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from './env.js';
import { registerAuth } from './auth.js';
import { authRoutes } from './routes/auth.js';
import { ledgerRoutes } from './routes/ledgers.js';
import { entryRoutes } from './routes/entries.js';
import { metaRoutes } from './routes/meta.js';

const buildServer = () => {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty'
      }
    }
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  return app;
};

export const app = buildServer();

const start = async () => {
  await app.register(cors, {
    origin: env.frontendUrl,
    credentials: true
  });

  await app.register(sensible);
  await app.register(rateLimit, { max: env.rateLimit, timeWindow: '1 minute' });
  await registerAuth(app);

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(ledgerRoutes, { prefix: '/api/ledgers' });
  app.register(entryRoutes, { prefix: '/api/ledgers/:ledgerId/entries' });
  app.register(metaRoutes, { prefix: '/api/meta' });

  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
    app.log.info(`API ready on ${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
