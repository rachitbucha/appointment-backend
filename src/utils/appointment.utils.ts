import moment from 'moment-timezone';
import { Event } from '@app/interface/appointment.interface';
import { DOCTOR_AVAILABILITY } from '@app/const/availability.const';

export class AppointmentUtils {
  static generateStaticSlots(timestamp: number, userTimezone: string, duration: number = 30): string[] {
    const slots: string[] = [];

    const { startHour, endHour, timezone: doctorTimezone, eveningStartHour, eveningStartMinute } = DOCTOR_AVAILABILITY[0];

    const userSelectedStartOfDay = moment.tz(timestamp, userTimezone).startOf('day');
    const userSelectedEndOfDay = userSelectedStartOfDay.clone().endOf('day');

    const doctorSelectedStartOfDay = moment.tz(timestamp, doctorTimezone).startOf('day');
    const doctorStartTime = doctorSelectedStartOfDay.clone().set({ hour: startHour, minute: 0 });
    const doctorEndTime = doctorSelectedStartOfDay.clone().set({ hour: endHour, minute: 0 });

    const userDoctorStartTime = doctorStartTime.clone().tz(userTimezone);
    const userDoctorEndTime = doctorEndTime.clone().tz(userTimezone);

    const effectiveStartTime = moment.max(userSelectedStartOfDay, userDoctorStartTime);
    const effectiveEndTime = moment.min(userSelectedEndOfDay, userDoctorEndTime);

    const currentTime = moment.tz(userTimezone);

    let currentSlotTime = effectiveStartTime.clone();
    while (currentSlotTime.isBefore(effectiveEndTime)) {
      if (currentSlotTime.isAfter(currentTime)) {
        slots.push(currentSlotTime.format('YYYY-MM-DDTHH:mm:ssZ'));
      }
      currentSlotTime.add(duration, 'minutes');
    }

    if (eveningStartHour !== null && eveningStartMinute !== null) {
      const eveningStartTime = userSelectedStartOfDay
        .clone()
        .set({ hour: eveningStartHour, minute: eveningStartMinute });

      if (effectiveEndTime.isBefore(eveningStartTime)) {
        let eveningSlotTime = eveningStartTime.clone();
        while (eveningSlotTime.isBefore(userSelectedEndOfDay)) {
          if (eveningSlotTime.isAfter(currentTime)) {
            slots.push(eveningSlotTime.format('YYYY-MM-DDTHH:mm:ssZ'));
          }
          eveningSlotTime.add(duration, 'minutes');
        }
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
