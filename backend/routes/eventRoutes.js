import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { addBooking, getEventBookings } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Re-route into booking routes
// router.use('/:eventId/bookings', bookingRouter);

router
  .route('/')
  .get(getEvents)
  .post(protect, authorize('admin'), createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize('admin'), updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

router
  .route('/:eventId/bookings')
  .get(protect, authorize('admin'), getEventBookings)
  .post(protect, addBooking);

export default router;
