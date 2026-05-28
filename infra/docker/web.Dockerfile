FROM node:24-alpine

WORKDIR /workspace

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json eslint.config.mjs .prettierrc.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY apps/web apps/web
COPY packages/shared packages/shared

RUN pnpm --filter @qdd/shared build && pnpm --filter @qdd/web build
RUN chown -R node:node /workspace /pnpm

USER node

EXPOSE 5173

CMD ["pnpm", "--filter", "@qdd/web", "dev"]
