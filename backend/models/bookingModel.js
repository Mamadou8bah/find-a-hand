const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  service: {
    type: String,
    required: true
  },
  taskDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, 
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  handyman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Handyman',
    default: null
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
