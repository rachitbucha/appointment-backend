import FirestoreService from '@app/config/firestore.config';
import { HTTP_STATUS } from '@app/const/http-status.const';
import { HttpException } from '@app/handler/exception.handler';
import { Event } from '@app/interface/appointment.interface';

export class FirebaseService {
  private static instance: FirebaseService;
  private firestoreService: FirestoreService;
  private constructor() {
    this.firestoreService = FirestoreService.getInstance();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async fetch(startDate: string, endDate: string, collectionName: string): Promise<Event[]> {
    try {
      const collectionRef = this.firestoreService.firestore.collection(collectionName);

      const collectionSnapshot = await collectionRef
        .where('startTime', '>=', startDate)
        .where('endTime', '<=', endDate)
        .get();

      const events: Event[] = collectionSnapshot.docs.map(
        (doc: { data: () => Record<string, string>; id: string }) => ({
          ...doc.data(),
          id: doc.id,
        }),
      ) as unknown as Event[];

      return events;
    } catch (error) {
      throw error;
    }
  }

  async save(event: Event, collectionName: string): Promise<void> {
    try {
      await this.firestoreService.firestore.collection(collectionName).add(event);
    } catch (error) {
      throw error;
    }
  }

  async saveEventWithConflictHandling(event: Event, collectionName: string): Promise<void> {
    try {
      const collectionRef = this.firestoreService.firestore.collection(collectionName);

      await this.firestoreService.firestore.runTransaction(async (transaction) => {
        const conflictQuery = collectionRef
          .where('startTime', '>=', event.startTime)
          .where('endTime', '<=', event.endTime);

        const conflictSnapshot = await transaction.get(conflictQuery);

        if (!conflictSnapshot.empty) {
          throw new Error('Unable to book above slot...');
        }

        const docRef = collectionRef.doc();
        transaction.set(docRef, event);
      });
    } catch (error) {
      throw new HttpException(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Cannot book above slot is already been booked.');
    }
  }
}
