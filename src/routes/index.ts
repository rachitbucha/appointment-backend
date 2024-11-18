import { Router } from 'express';
import AppointmentRoutes from '@app/routes/appointment.routes';

const router = Router();

const appointmentRoutes = AppointmentRoutes.getInstance();

router.use('/appointment', appointmentRoutes.router);

export default router;
