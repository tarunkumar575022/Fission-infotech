const express = require('express');
const router = express.Router();
const {
  createReservation,
  getAllReservations,
  getMyReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  confirmReservation,
  deleteReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/', 
  protect, 
  [
    body('tableId', 'Valid table ID is required').isMongoId(),
    body('reservationDate', 'Valid date is required').isISO8601(),
    body('timeSlot', 'Valid time slot is required').matches(/^(09|1[0-9]|2[0-1]):00$/),
    body('numberOfGuests', 'At least 1 guest is required').isInt({ min: 1 }),
    body('guestName', 'Guest name is required').notEmpty(),
    body('mobileNumber', 'Mobile number is required').notEmpty()
  ],
  validateRequest,
  createReservation
);

router.get('/', protect, requireRole('admin'), getAllReservations);
router.get('/my', protect, getMyReservations);
router.get('/:id', protect, getReservationById);

router.put('/:id', 
  protect,
  [
    body('tableId', 'Valid table ID is required').optional().isMongoId(),
    body('reservationDate', 'Valid date is required').optional().isISO8601(),
    body('timeSlot', 'Valid time slot is required').optional().matches(/^(09|1[0-9]|2[0-1]):00$/),
    body('numberOfGuests', 'At least 1 guest is required').optional().isInt({ min: 1 })
  ],
  validateRequest, 
  updateReservation
);

router.patch('/:id/cancel', protect, cancelReservation);
router.patch('/:id/confirm', protect, requireRole('admin'), confirmReservation);
router.delete('/:id', protect, requireRole('admin'), deleteReservation);

module.exports = router;
