import { Inject, Injectable } from '@nestjs/common';

import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditEventInput = {
  actorId: string | null;
  actorLabel: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  ledgerId?: string | null;
  metadata?: Record<string, unknown>;
  requestId: string;
};

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async record(input: AuditEventInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorLabel: input.actorLabel,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        ledgerId: input.ledgerId ?? null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonObject,
        requestId: input.requestId
      }
    });
  }
}
