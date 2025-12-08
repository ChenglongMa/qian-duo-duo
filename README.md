# QianDuoDuo (QDD)

跨平台 PWA 记账应用的骨架，包含 React + Vite 前端、Fastify + Prisma 后端以及 Docker Compose。

## 快速开始（本地）

```bash
npm install
npm run dev:api   # 端口 4000
npm run dev:web   # 端口 5173
```

创建数据库后运行迁移：

```bash
cd apps/api
npx prisma migrate dev
```

## Docker

```bash
docker compose up --build
```

服务：`web`(5173)、`api`(4000)、`db`(5432)、`redis`(6379)、`minio`(9000/9001)。

## 主要能力
- 前端：PWA（离线缓存 + runtime API 缓存）、React Query、MUI、Dexie 离线队列、基本报表（ECharts）。
- 后端：注册/登录/改密、账本与类别 CRUD、账目新增/列表、疑似重复检测、汇率存取、LLM 分类规则占位。
- 数据库：PostgreSQL Prisma schema（用户、账本、类别、商家、项目、账目、附件、汇率）。

后续可扩展：OCR/LLM 队列、附件存储（MinIO）、导入/导出、审计日志等。
