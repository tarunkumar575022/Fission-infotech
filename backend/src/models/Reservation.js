const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    reservationDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      enum: [
        '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00',
        '21:00'
      ],
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    guestName: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ table: 1, reservationDate: 1, timeSlot: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
