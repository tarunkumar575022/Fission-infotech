const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { checkTableAvailability, findAvailableTables } = require('../utils/availabilityChecker');

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  const { tableId, reservationDate, timeSlot, numberOfGuests, notes, guestName, mobileNumber } = req.body;

  try {
    const table = await Table.findById(tableId);
    if (!table || !table.isActive) {
      return res.status(400).json({ success: false, message: 'Table not found or inactive' });
    }

    if (new Date(reservationDate) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: 'Reservation date must be in the future' });
    }

    if (numberOfGuests < 1 || table.capacity < numberOfGuests) {
      return res.status(400).json({ success: false, message: 'Invalid number of guests for this table' });
    }

    const isAvailable = await checkTableAvailability(tableId, new Date(reservationDate), timeSlot);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'This table is already booked for the selected date and time slot'
      });
    }

    const reservation = await Reservation.create({
      customer: req.user._id,
      table: tableId,
      reservationDate: new Date(reservationDate),
      timeSlot,
      numberOfGuests,
      notes,
      guestName,
      mobileNumber
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
const getAllReservations = async (req, res) => {
  const { date, status, page = 1, limit = 10 } = req.query;

  // Ensure isDeleted is implicitly false
  const query = { isDeleted: { $ne: true } };

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.reservationDate = {
      $gte: searchDate,
      $lt: nextDay
    };
  }

  if (status) {
    query.status = status;
  }

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Reservation.countDocuments(query);
    
    const reservations = await Reservation.find(query)
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort({ reservationDate: 1, timeSlot: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        total: totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      customer: req.user._id,
      isDeleted: { $ne: true }
    })
      .populate('table', 'tableNumber capacity')
      .sort({ reservationDate: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (req.user.role !== 'admin' && reservation.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private
const updateReservation = async (req, res) => {
  const { tableId, reservationDate, timeSlot, numberOfGuests, notes } = req.body;

  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (req.user.role !== 'admin' && reservation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    if (reservation.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Cannot modify a cancelled reservation' });
    }

    if (tableId || reservationDate || timeSlot) {
      const tId = tableId || reservation.table;
      const rDate = reservationDate ? new Date(reservationDate) : reservation.reservationDate;
      const tSlot = timeSlot || reservation.timeSlot;

      const isAvailable = await checkTableAvailability(tId, rDate, tSlot, reservation._id);
      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: 'This table is already booked for the selected date and time slot'
        });
      }
    }

    reservation.table = tableId || reservation.table;
    reservation.reservationDate = reservationDate ? new Date(reservationDate) : reservation.reservationDate;
    reservation.timeSlot = timeSlot || reservation.timeSlot;
    reservation.numberOfGuests = numberOfGuests || reservation.numberOfGuests;
    reservation.notes = notes !== undefined ? notes : reservation.notes;

    const updatedReservation = await reservation.save();
    res.json({ success: true, data: updatedReservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel reservation
// @route   PATCH /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && reservation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this reservation' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Reservation is already cancelled' });
    }

    // Check if reservation is in the past
    if (new Date(reservation.reservationDate) < new Date().setHours(0,0,0,0)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel past reservations' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm a cancelled reservation
// @route   PATCH /api/reservations/:id/confirm
// @access  Private/Admin
const confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('table');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Reservation is already confirmed' });
    }

    // Check if table is available for this slot again
    const availableTables = await findAvailableTables(
      reservation.reservationDate,
      reservation.timeSlot,
      reservation.numberOfGuests
    );

    const isAvailable = availableTables.some(t => t._id.toString() === reservation.table._id.toString());
    
    if (!isAvailable) {
      return res.status(409).json({ success: false, message: 'Table is already booked for this slot.' });
    }

    reservation.status = 'confirmed';
    await reservation.save();

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a reservation permanently
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id, 
      { isDeleted: true },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getMyReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  confirmReservation,
  deleteReservation
};
