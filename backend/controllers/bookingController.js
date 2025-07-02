const Booking = require('../models/bookingModel');

const createBooking = async (req, res) => {
  try {
    const { service, taskDescription, date, time, phone, location } = req.body;

    
    if (!service || !taskDescription || !date || !time || !phone || !location) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const booking = await Booking.create({
      user: req.user._id, 
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

const getBooking = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }); 
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not authorized' });
    }

    
    booking.status = 'Cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
};

module.exports = { createBooking,getBooking ,cancelBooking };
