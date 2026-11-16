import moduleAlias from 'module-alias';

// Dynamically bind '@' alias to the active source directory (src in dev, dist in production)
(moduleAlias as any).addAlias('@', __dirname);
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from '@/config';
import { connectDatabase } from '@/config/database';
import { logger } from '@/config/logger';
import { generalLimiter } from '@/middlewares/rateLimiter';
import { errorHandler } from '@/middlewares/errorHandler';
import routes from '@/routes';
import { usersDb, accountsDb, transactionsDb } from '@/database';

const app = express();

const corsOriginsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,https://frontend-taupe-chi-53.vercel.app';
const allowedOrigins = corsOriginsEnv.split(',').map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id', 'X-Request-Id'],
  credentials: true,
}));
app.use(cookieParser(config.cookie.secret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err && (err as any).type === 'entity.parse.failed') {
    res.status(204).end();
    return;
  }
  next(err);
});

app.use((req, _res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  (req as any).requestId = requestId;
  next();
});

app.use('/api', generalLimiter);

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  app.get('/api/debug/users', (_req, res) => {
    const users = usersDb.findAll().map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json({ success: true, data: users, total: users.length });
  });

  app.get('/api/debug/accounts', (_req, res) => {
    const accounts = accountsDb.findAll();
    res.json({ success: true, data: accounts, total: accounts.length });
  });

  app.get('/api/debug/transactions', (_req, res) => {
    const transactions = transactionsDb.findAll();
    res.json({ success: true, data: transactions, total: transactions.length });
  });
}

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'NovaBank API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'NovaBank API is running',
    data: {
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    errors: null,
  });
});

app.use('/api', routes);

app.use(errorHandler);

// Eager database initialization
connectDatabase().catch((err) => {
  logger.error('Failed to initialize database:', err);
});

let server: ReturnType<typeof app.listen>;

async function start(): Promise<void> {
  try {
    await connectDatabase();

    server = app.listen(config.port, () => {
      logger.info(`NovaBank API server started on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  logger.info('Graceful shutdown completed');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  start();
}

export { app, start };
export default app;
// Support CommonJS export for serverless runtimes
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
  // @ts-ignore
  module.exports = app;
  // @ts-ignore
  module.exports.default = app;
}
