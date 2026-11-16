import { logger } from '@/config/logger';

interface MockJob {
  id: string;
  data: Record<string, unknown>;
}

interface MockQueue {
  name: string;
  add: (name: string, data: Record<string, unknown>) => Promise<MockJob>;
  process: (handler: (job: MockJob) => Promise<void>) => void;
}

const queues: Record<string, MockQueue> = {};

function createQueue(name: string): MockQueue {
  if (queues[name]) return queues[name];

  const queue: MockQueue = {
    name,
    async add(jobName: string, data: Record<string, unknown>) {
      const job: MockJob = { id: `${name}-${Date.now()}`, data };
      logger.info(`Job queued: ${name} - ${jobName}`, { jobId: job.id });
      return job;
    },
    process(_handler: (job: MockJob) => Promise<void>) {
      logger.info(`Worker registered for queue: ${name}`);
    },
  };

  queues[name] = queue;
  return queue;
}

export const emailQueue = createQueue('email');
export const smsQueue = createQueue('sms');
export const statementQueue = createQueue('statement');
export const notificationQueue = createQueue('notification');
export const auditQueue = createQueue('audit');

export function registerWorkers(): void {
  const emailWorker = async (job: MockJob) => {
    logger.info(`Processing email job: ${job.id}`, job.data);
  };

  const statementWorker = async (job: MockJob) => {
    logger.info(`Processing statement job: ${job.id}`, job.data);
  };

  const notificationWorker = async (job: MockJob) => {
    logger.info(`Processing notification job: ${job.id}`, job.data);
  };

  const auditWorker = async (job: MockJob) => {
    logger.info(`Processing audit job: ${job.id}`, job.data);
  };

  emailQueue.process(emailWorker);
  statementQueue.process(statementWorker);
  notificationQueue.process(notificationWorker);
  auditQueue.process(auditWorker);

  logger.info('All queue workers registered');
}

export default { emailQueue, smsQueue, statementQueue, notificationQueue, auditQueue, registerWorkers };
