import bcrypt from 'bcryptjs';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { env } from './env.js';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export const buildJwtPayload = (user: { id: string; email: string; name: string; mainCurrency: string }) => ({
  sub: user.id,
  email: user.email,
  name: user.name,
  mainCurrency: user.mainCurrency
});

export const registerAuth = async (app: FastifyInstance) => {
  app.register(fastifyJwt, {
    secret: env.jwtSecret
  });

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
};

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string;
      email: string;
      name: string;
      mainCurrency: string;
      iat: number;
      exp: number;
    };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
