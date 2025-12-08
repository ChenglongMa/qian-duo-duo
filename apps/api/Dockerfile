FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm install
RUN npm run build:api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
CMD ["node", "apps/api/dist/main.js"]
