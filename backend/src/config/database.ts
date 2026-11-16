import { seedDatabase } from '@/database/seed';
import { seedVulnDatabase } from '@/vuln/seed';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  seedDatabase();
  seedVulnDatabase();
  logger.info('JSON database initialized and seeded');
}

export default connectDatabase;
