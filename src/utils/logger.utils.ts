import { ConfigService } from '@app/config/env.config';
import winston from 'winston';
import type { Logger } from 'winston';
import { format } from 'winston';

class LoggerService {
  private static instance: LoggerService;
  private logger: Logger;
  private configService: ConfigService = ConfigService.getInstance();
  private isProduction = this.configService.getEnv('NODE_ENV') === 'production';

  private constructor() {
    const formattedTimestamp = format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS',
    });

    const colorizer = format.colorize({
      colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        debug: 'white',
        trace: 'grey',
      },
    });

    const WINSTON_DEV_FORMAT = format.combine(
      format.errors({ stack: true }),
      colorizer,
      formattedTimestamp,
      format.simple(),
    );

    const WINSTON_PROD_FORMAT = format.combine(format.errors({ stack: true }), formattedTimestamp, format.json());

    const logLevels = {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5,
    } as const;

    this.logger = winston.createLogger({
      levels: logLevels,
      level: process.env.LOG_LEVEL ?? 'info',
      format: this.isProduction ? WINSTON_PROD_FORMAT : WINSTON_DEV_FORMAT,
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'logs/app.log' })],
    });
  }

  public static getInstance(): Logger {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance.getLogger();
  }

  public getLogger(): Logger {
    return this.logger;
  }
}

export default LoggerService;
