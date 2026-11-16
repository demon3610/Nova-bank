import winston from 'winston';
import path from 'path';
import { config } from './index';

const logDir = path.resolve(__dirname, '../../logs');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
      const reqId = requestId ? ` [${requestId}]` : '';
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} ${level}${reqId}: ${message}${metaStr}`;
    })
  ),
});

const fileTransports: winston.transport[] = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 5242880,
    maxFiles: 10,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

const transports: winston.transport[] = [consoleTransport];

if (config.env === 'production') {
  transports.push(...fileTransports);
}

export const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

export function childLogger(requestId: string): winston.Logger {
  return logger.child({ requestId });
}

export default logger;
