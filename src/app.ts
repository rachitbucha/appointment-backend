import { Server } from './server';

class App {
  private server: Server;

  constructor() {
    this.server = new Server();
  }

  public run(): void {
    this.server.start();
  }
}

const app = new App();
app.run();
