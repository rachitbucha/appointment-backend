import { ConfigService } from './services/config.service';
import { Server } from './server';

class App {
  private configService: ConfigService;
  private server: Server;

  constructor() {
    this.configService = new ConfigService();
    this.server = new Server(this.configService);
  }

  public run(): void {
    this.server.start();
  }
}

const app = new App();
app.run();
