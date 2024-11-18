import moment from 'moment-timezone';
import { AppointmentUtils } from '@app/utils/appointment.utils';
import { DOCTOR_AVAILABILITY } from '../const/availability.const';
import { HttpException } from '@app/handler/exception.handler';
import { HTTP_STATUS } from '@app/const/http-status.const';
import { Event } from '@app/interface/appointment.interface';

describe('generateStaticSlots', () => {
  it('should generate correct slots based on doctor and user timezones', () => {
    const timestamp = moment.tz('2024-11-18', DOCTOR_AVAILABILITY.timezone).valueOf();
    const userTimezone = 'Europe/London';
    const duration = 30;
    const slots = AppointmentUtils.generateStaticSlots(timestamp, userTimezone, duration);
    const expectedSlotCount = (DOCTOR_AVAILABILITY.endHour - DOCTOR_AVAILABILITY.startHour) * (60 / duration);
    expect(slots.length).toBe(expectedSlotCount);
  });
});

describe('validateDateRange', () => {
  it('should throw an error for invalid start date', () => {
    const invalidStartDate = NaN;
    const validEndDate = new Date().getTime() + 1000000; 
    expect(() => AppointmentUtils.validateDateRange(invalidStartDate, validEndDate)).toThrow(
      new HttpException(HTTP_STATUS.NOT_ACCEPTABLE, 'Invalid start date. Please provide a valid timestamp.', [
        `${invalidStartDate} is not valid.`,
      ]),
    );
  });

  it('should throw an error if the start date is in the past', () => {
    const startDateInThePast = 10000; 
    const validEndDate = new Date().getTime() + 1000000; 
    expect(() => AppointmentUtils.validateDateRange(startDateInThePast, validEndDate)).toThrow(
      new HttpException(HTTP_STATUS.NOT_ACCEPTABLE, 'Start date cannot be in the past.', [
        `${startDateInThePast} is not valid.`,
      ]),
    );
  });

  it('should throw an error if the end date exceeds the current month', () => {
    const validStartDate = new Date().getTime() + 1000000; 
    const invalidEndDate = new Date(new Date().setMonth(new Date().getMonth() + 2)).getTime();

    expect(() => AppointmentUtils.validateDateRange(validStartDate, invalidEndDate)).toThrow(
      new HttpException(HTTP_STATUS.NOT_ACCEPTABLE, 'End date cannot exceed the current month.', [
        `${invalidEndDate} max date range limit reached.`,
      ]),
    );
  });

  it('should throw an error if the start date is after the end date', () => {
    const startDateAfterEndDate = new Date().getTime() + 2000000; 
    const validEndDate = new Date().getTime() + 1000000; 
    expect(() => AppointmentUtils.validateDateRange(startDateAfterEndDate, validEndDate)).toThrow(
      new HttpException(HTTP_STATUS.NOT_ACCEPTABLE, 'Start date cannot be after the end date.', [
        `${startDateAfterEndDate} is not valid.`,
      ]),
    );
  });

  it('should not throw an error for valid date range', () => {
    const validStartDate = new Date().getTime() + 1000000; 
    const validEndDate = new Date().getTime() + 2000000; 
    expect(() => AppointmentUtils.validateDateRange(validStartDate, validEndDate)).not.toThrow();
  });
});

describe('getAvailableSlots', () => {
  let timezone: string;
  let dailySlots: string[];
  beforeEach(() => {
    timezone = 'Asia/Kolkata';
    dailySlots = ['2024-11-18T23:30:00+05:30', '2024-11-19T00:00:00+05:30', '2024-11-19T00:30:00+05:30'];
  });

  it('should return available slots when no events are scheduled', () => {
    const existingEvents: Event[] = [];
    const availableSlots = AppointmentUtils.getAvailableSlots(dailySlots, existingEvents, timezone);
    expect(availableSlots).toEqual(dailySlots);
  });

  it('should return available slots excluding overlapping events', () => {
    const existingEvents: Event[] = [
      { startTime: '2024-11-19T00:00:00+05:30', endTime: '2024-11-19T00:30:00+05:30', duration: 30 }, 
    ];
    const availableSlots = AppointmentUtils.getAvailableSlots(dailySlots, existingEvents, timezone);
    expect(availableSlots).toEqual(['2024-11-18T23:30:00+05:30', '2024-11-19T00:30:00+05:30']);
  });

  it('should return available slots even if events are scheduled before or after the given slots', () => {
    const existingEvents: Event[] = [
      { startTime: '2024-11-18T06:00:00Z', endTime: '2024-11-18T07:00:00Z', duration: 30 },
      { startTime: '2024-11-18T15:00:00Z', endTime: '2024-11-18T16:00:00Z', duration: 30 },
    ];
    const availableSlots = AppointmentUtils.getAvailableSlots(dailySlots, existingEvents, timezone);
    expect(availableSlots).toEqual(dailySlots); 
  });

  it('should handle edge case with overlapping events exactly at slot times', () => {
    const existingEvents: Event[] = [
      { startTime: '2024-11-18T23:30:00+05:30', endTime: '2024-11-19T00:00:00+05:30', duration: 30 },
      { startTime: '2024-11-19T00:00:00+05:30', endTime: '2024-11-19T00:30:00+05:30', duration: 30 },
    ];
    const availableSlots = AppointmentUtils.getAvailableSlots(dailySlots, existingEvents, timezone);
    expect(availableSlots).toEqual(['2024-11-19T00:30:00+05:30']); 
  });

  it('should block 2 slots when an event is created at 2:00 PM with a 50-minute duration', () => {
    const existingEvents: Event[] = [
      { startTime: '2024-11-18T23:30:00+05:30', endTime: '2024-11-19T00:01:20+05:30', duration: 50 },
    ];
    const availableSlots = AppointmentUtils.getAvailableSlots(dailySlots, existingEvents, timezone);
    console.log(availableSlots)
    expect(availableSlots).toEqual(['2024-11-19T00:30:00+05:30']); 
  });

  it('should return an empty array if all slots are taken by events', () => {
    const existingEvents: Event[] = [
      { startTime: '2024-11-18T23:30:00+05:30', endTime: '2024-11-19T00:00:00+05:30', duration: 30 },
      { startTime: '2024-11-19T00:00:00+05:30', endTime: '2024-11-19T00:30:00+05:30', duration: 30 },
      { startTime: '2024-11-19T00:30:00+05:30', endTime: '2024-11-19T01:00:00+05:30', duration: 30 },
    ];
    const availableSlots = AppointmentUtils.getAvailableSlots(dailySlots, existingEvents, timezone);
    expect(availableSlots).toEqual([]);
  });
});
