const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

async function checkTableAvailability(
  tableId,
  reservationDate,
  timeSlot,
  excludeReservationId
) {
  const conflictQuery = {
    table: tableId,
    reservationDate: {
      $gte: startOfDay(reservationDate),
      $lte: endOfDay(reservationDate),
    },
    timeSlot: timeSlot,
    status: { $ne: 'cancelled' },
    isDeleted: { $ne: true }
  };

  if (excludeReservationId) {
    conflictQuery._id = { $ne: excludeReservationId };
  }

  const conflict = await Reservation.findOne(conflictQuery);
  return !conflict; // true = available
}

async function findAvailableTables(reservationDate, timeSlot, numberOfGuests) {
  const suitableTables = await Table.find({
    capacity: { $gte: numberOfGuests },
    isActive: true,
  });

  const availableTables = [];
  for (const table of suitableTables) {
    const isAvailable = await checkTableAvailability(
      table._id,
      reservationDate,
      timeSlot
    );
    if (isAvailable) {
      availableTables.push(table);
    }
  }
  return availableTables;
}

module.exports = {
  checkTableAvailability,
  findAvailableTables,
};
