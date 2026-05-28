import { Logger } from '@nestjs/common';

const logger = new Logger('Worker');
const heartbeatIntervalMs = 60_000;

logger.log('QDD worker placeholder started; BullMQ jobs begin in a later milestone.');

const heartbeat = setInterval(() => {
  logger.debug('QDD worker placeholder heartbeat.');
}, heartbeatIntervalMs);

function shutdown(signal: NodeJS.Signals): void {
  clearInterval(heartbeat);
  logger.log(`QDD worker placeholder received ${signal}; shutting down.`);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
