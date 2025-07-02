// controllers/bookingController.js
const Booking = require('../models/bookingModel');

const createBooking = async (req, res) => {
  try {
    const { service, taskDescription, date, time, phone, location } = req.body;

    // Basic validation
    if (!service || !taskDescription || !date || !time || !phone || !location) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const booking = await Booking.create({
      user: req.user._id, // from protect middleware
      service,
      taskDescription,
      date,
      time,
      phone,
      location,
      status: 'Pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

module.exports = { createBooking };
