import { DOCTOR_AVAILABILITY } from '@app/const/availability.const';
import moment from 'moment-timezone';
import { Event } from '@app/interface/appointment.interface';

export class AppointmentUtils {
  static generateStaticSlots(timestamp: number, userTimezone: string, duration: number = 30): string[] {
    const slots: string[] = [];

    const { startHour, endHour, timezone: doctorTimezone } = DOCTOR_AVAILABILITY;

    const baseMoment = moment.tz(timestamp, doctorTimezone).startOf('day');

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const slotMomentDoctorTZ = baseMoment.clone().set({
          hour,
          minute,
          second: 0,
          millisecond: 0,
        });

        const slotMomentUserTZ = slotMomentDoctorTZ.clone().tz(userTimezone);

        const formattedSlot = slotMomentUserTZ.format('YYYY-MM-DDTHH:mm:ssZ');
        slots.push(formattedSlot);
      }
    }

    return slots;
  }

  static getAvailableSlots(dailySlots: string[], existingEvents: Event[], timezone: string): string[] {
    const processedEvents = existingEvents.map((event) => ({
      startTime: moment.utc(event.startTime).tz(timezone),
      endTime: moment.utc(event.endTime).tz(timezone),
    }));

    processedEvents.sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());

    const availableSlots: string[] = [];
    let eventIndex = 0;

    for (const slot of dailySlots) {
      const slotTime = moment.tz(slot, timezone);

      while (eventIndex < processedEvents.length && processedEvents[eventIndex].endTime.isSameOrBefore(slotTime)) {
        eventIndex++;
      }

      const currentEvent = processedEvents[eventIndex];
      if (!currentEvent || slotTime.isSameOrAfter(currentEvent.endTime) || slotTime.isBefore(currentEvent.startTime)) {
        availableSlots.push(slot);
      }
    }

    return availableSlots;
  }
}
