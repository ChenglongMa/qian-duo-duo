import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { ApiExceptionFilter } from './common/api-exception.filter';
import { requestIdMiddleware } from './common/request-id.middleware';

export function setupApplication(app: INestApplication): void {
  app.use(requestIdMiddleware);
  app.use(helmet());
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
