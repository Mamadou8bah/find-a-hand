const Booking = require('../models/bookingModel');

const createBooking = async (req, res) => {
  try {
    const { handymanId, service, taskDescription, date, time, phone, location } = req.body;

    if (!handymanId || !service || !taskDescription || !date || !time || !phone || !location) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Validate date is not in the past
    const bookingDate = new Date(date);
    if (bookingDate < new Date()) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    const booking = await Booking.create({
      user: req.user._id, 
      handymanId,
      service,
      taskDescription,
      date: bookingDate,
      time,
      phone,
      location,
      status: 'Pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
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
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

  
    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching booking' });
  }
};


const getBookingsForCurrentHandyman = async (req, res) => {
  try {
    const bookings = await Booking.find({ handymanId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};


module.exports = { createBooking,getBooking ,cancelBooking, getBookingById,getBookingsForCurrentHandyman }; 
