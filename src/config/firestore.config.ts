import { initializeApp, cert, ServiceAccount, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { ConfigService } from '@app/config/env.config';

class FirestoreService {
  private static instance: FirestoreService;
  private configService: ConfigService;
  private _firestore: Firestore;

  private constructor() {
    this.configService = ConfigService.getInstance();

    const serviceAccount: ServiceAccount = {
      projectId: this.configService.getEnv('FIREBASE_PROJECT_ID'),
      clientEmail: this.configService.getEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.configService.getEnv('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
    };

    const app: App = initializeApp({
      credential: cert(serviceAccount),
    });

    this._firestore = getFirestore(app);
  }

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  public get firestore(): Firestore {
    return this._firestore;
  }
}

export default FirestoreService;
