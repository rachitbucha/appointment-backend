import { AppointmentUtils } from '@app/utils/appointment.utils';
import moment, { duration } from 'moment';
import { Event } from '@app/interface/appointment.interface';
import { FirebaseService } from '@app/services/firestore.service';
import { HttpException } from '@app/handler/exception.handler';
import { HttpResponse } from '@app/handler/response.handler';

class AppointmentService {
  private static instance: AppointmentService;
  private firebaseService: FirebaseService;

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
  }

  async getFreeSlots(timestamp: number, timezone: string): Promise<HttpResponse> {
    try {
      const startMomentUTC = moment.tz(timestamp, timezone).startOf('day').utc();
      const endMomentUTC = moment.tz(timestamp, timezone).endOf('day').utc();
      const existingEvents = await this.firebaseService.fetch(startMomentUTC.format(), endMomentUTC.format(), 'events');
      const dailySlots = AppointmentUtils.generateStaticSlots(timestamp, timezone);
      const availableSlots = AppointmentUtils.getAvailableSlots(dailySlots, existingEvents, timezone);

      return new HttpResponse('Slots Retrived Successfully', availableSlots);
    } catch (error: any) {
      throw new HttpException(error?.status, error?.message);
    }
  }

  async createEvent(timestamp: number, timezone: string, duration: number): Promise<HttpResponse> {
    try {
      const startMoment = moment.tz(timestamp, timezone);
      const startMinute = startMoment.minute();
      const alignedMinute = Math.floor(startMinute / duration) * duration;
      startMoment.minute(alignedMinute).second(0).millisecond(0);

      const startMomentUTC = startMoment.utc();
      const endMomentUTC = startMomentUTC.clone().add(duration, 'minutes');

      const event: Event = {
        startTime: startMomentUTC.format(),
        endTime: endMomentUTC.format(),
        duration: duration,
      };

      await this.firebaseService.saveEventWithConflictHandling(event, 'events');
      return new HttpResponse('Event Successfully Created', []);
    } catch (error: any) {
      throw new HttpException(error?.status, error?.message);
    }
  }

  async getEvents(startTimestamp: number, endTimestamp: number, timezone: string): Promise<HttpResponse> {
    try {
      const startMoment = moment.tz(startTimestamp, timezone).utc();
      const endMoment = moment.tz(endTimestamp, timezone).utc();

      const existingEvents = await this.firebaseService.fetch(startMoment.format(), endMoment.format(), 'events');

      const processedEvents = existingEvents?.map((event) => ({
        startTime: moment.utc(event.startTime).tz(timezone),
        endTime: moment.utc(event.endTime).tz(timezone),
        duration: event.duration,
      }));

      return new HttpResponse('Events Retrived Successfully', processedEvents);
    } catch (error: any) {
      throw new HttpException(error?.status, error?.message);
    }
  }
}

export default AppointmentService;
