import express, { Express } from 'express';
import { ConfigService } from './services/config.service';
import logger from './utils/logger';

export class Server {
  private app: Express;
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.app = express();
  }

  public start(): void {
    const port = parseInt(this.configService.getEnv('API_PORT', '3000'));
    this.app.listen(port, () => {
      logger.info({
        message: `🚀 App listening on the port ${port}`,
        data: {
          env: this.configService.getEnv('NODE_ENV'),
        },
      });
    });
  }

  public getApp(): Express {
    return this.app;
  }
}
