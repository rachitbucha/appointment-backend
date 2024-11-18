import AppointmentController from '@app/controllers/appointement.controller';
import { Router } from 'express';

class AppointmentRoutes {
  public router = Router();
  public appointmentController: AppointmentController;
  private static instance: AppointmentRoutes;

  public static getInstance(): AppointmentRoutes {
    if (!this.instance) {
      this.instance = new AppointmentRoutes();
    }
    return this.instance;
  }

  constructor() {
    this.appointmentController = AppointmentController.getInstance();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/free-slots`, this.appointmentController.freeSlots);
    this.router.post(`/create-event`, this.appointmentController.createEvent);
    this.router.get(`/events`, this.appointmentController.getEvents);
  }
}

export default AppointmentRoutes;
