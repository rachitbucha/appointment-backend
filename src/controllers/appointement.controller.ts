import { HttpResponse } from '@app/handler/response.handler';
import AppointmentService from '@app/services/appointement.service';
import { NextFunction, Request, Response } from 'express';

class AppointmentController {
  private static instance: AppointmentController;
  private appointmentService: AppointmentService;

  private constructor() {
    this.appointmentService = AppointmentService.getInstance();
  }

  static getInstance(): AppointmentController {
    if (!AppointmentController.instance) {
      AppointmentController.instance = new AppointmentController();
    }
    return AppointmentController.instance;
  }

  freeSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timestamp, timezone } = req.query as Record<string, string>;
      const response: HttpResponse = await this.appointmentService.getFreeSlots(parseInt(timestamp), timezone);
      res.status(response.statusCode).json({ data: response.data, message: response.message });
    } catch (error) {
      next(error);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, timezone } = req.query as Record<string, string>;
      const response: HttpResponse = await this.appointmentService.getEvents(
        parseInt(startDate),
        parseInt(endDate),
        timezone,
      );
      res.status(response.statusCode).json({ data: response.data, message: response.message });
    } catch (error) {
      next(error);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timestamp, timezone, duration } = req.query as Record<string, string>;
      const response: HttpResponse = await this.appointmentService.createEvent(
        parseInt(timestamp),
        timezone,
        parseInt(duration),
      );
      res.status(response.statusCode).json({ data: response.data, message: response.message });
    } catch (error) {
      next(error);
    }
  };
}

export default AppointmentController;
