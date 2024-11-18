import express, { Express } from 'express';
import { ConfigService } from './config/env.config';
import LoggerService from '@app/utils/logger.utils';
import routes from './routes';
import { Logger } from 'winston';
import ErrorHandler from '@app/handler/error.handler';

export class Server {
  private app: Express;
  private configService: ConfigService;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor() {
    this.logger = LoggerService.getInstance();
    this.configService = ConfigService.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.app = express();
  }

  public start(): void {
    try {
      const port = parseInt(this.configService.getEnv('API_PORT', '3000'));

      this.app.use('/api', routes);

      this.app.use(this.errorHandler.handleError);

      this.app.listen(port, () => {
        this.logger.info({
          message: `🚀 App listening on the port ${port}`,
          data: {
            env: this.configService.getEnv('NODE_ENV'),
          },
        });
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to start the server',
        data: {
          error,
        },
      });
      process.exit(1);
    }
  }

  public getApp(): Express {
    return this.app;
  }
}
