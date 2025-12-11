FROM node:lts-bullseye AS builder

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm install
RUN npm run generate:db
RUN npm run build:api

FROM node:lts-bullseye AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/start.sh ./apps/api/start.sh

RUN chmod +x ./apps/api/start.sh

CMD ["sh", "apps/api/start.sh"]
