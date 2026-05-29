import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { ApiExceptionFilter } from './common/api-exception.filter';
import { requestIdMiddleware } from './common/request-id.middleware';

const DEFAULT_CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function corsOrigins(): string[] {
  const configured = process.env.WEB_ORIGIN;
  if (!configured) {
    return DEFAULT_CORS_ORIGINS;
  }

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function setupApplication(app: INestApplication): void {
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.enableCors({
    origin: corsOrigins(),
    credentials: true
  });
  app.useGlobalFilters(new ApiExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('QianDuoDuo API')
      .setDescription('Development-only QDD API documentation.')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
}
