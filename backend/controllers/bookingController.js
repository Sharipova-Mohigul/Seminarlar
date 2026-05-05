import Booking from '../models/Booking.js';
import Event from '../models/Event.js';

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private (Admin)
export const getBookings = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Booking.find().populate({
        path: 'event',
        select: 'title location date'
      }).populate({
        path: 'user',
        select: 'name email'
      });
    } else {
      query = Booking.find({ user: req.user.id }).populate({
        path: 'event',
        select: 'title location date'
      });
    }

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for a specific event
// @route   GET /api/v1/events/:eventId/bookings
// @access  Private (Admin)
export const getEventBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ event: req.params.eventId }).populate({
            path: 'user',
            select: 'name email'
        });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add booking
// @route   POST /api/v1/events/:eventId/bookings
// @access  Private
export const addBooking = async (req, res, next) => {
  try {
    req.body.event = req.params.eventId;
    req.body.user = req.user.id;

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check availability
    if (event.availableSeats <= 0) {
      return res.status(400).json({ success: false, message: 'No seats available for this event' });
    }

    // Check if user already booked
    const existingBooking = await Booking.findOne({ user: req.user.id, event: req.params.eventId });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already booked a seat for this event' });
    }

    const booking = await Booking.create(req.body);

    // Update event available seats
    event.availableSeats -= 1;
    await event.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
export const updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

import Cancellation from '../models/Cancellation.js';
import User from '../models/User.js';

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Capture info for cancellation log
    const event = booking.event;
    const user = await User.findById(booking.user);

    // Save to Cancellations log
    await Cancellation.create({
        user: booking.user,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'Unknown',
        eventTitle: event?.title || 'Unknown Event'
    });

    const eventToUpdate = await Event.findById(booking.event);
    
    await Booking.findByIdAndDelete(req.params.id);

    // Increase available seats back
    if (eventToUpdate) {
        eventToUpdate.availableSeats += 1;
        await eventToUpdate.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all cancellations (Admin)
// @route   GET /api/v1/bookings/cancelled
// @access  Private (Admin)
export const getCancelledBookings = async (req, res, next) => {
    try {
        const cancellations = await Cancellation.find().sort('-cancelledAt');
        res.status(200).json({ success: true, data: cancellations });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/v1/auth/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};
