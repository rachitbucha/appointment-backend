import { AppointmentUtils } from '@app/utils/appointment.utils';
import { Event } from '@app/interface/appointment.interface';

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
