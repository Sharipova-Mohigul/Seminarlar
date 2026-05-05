import express from 'express';
import {
  getBookings,
  updateBooking,
  deleteBooking,
  getCancelledBookings
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getBookings);
router.route('/cancelled').get(authorize('admin'), getCancelledBookings);
router.route('/:id').put(updateBooking).delete(deleteBooking);

export default router;
