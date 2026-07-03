const express = require('express');
const router = express.Router();
const {
  getTables,
  getAvailableTables,
  createTable,
  updateTable,
} = require('../controllers/tableController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.get('/', protect, getTables);
router.get('/available', protect, getAvailableTables);

router.post('/', 
  protect, 
  requireRole('admin'), 
  [
    body('tableNumber', 'Table number is required and must be numeric').isNumeric(),
    body('capacity', 'Capacity must be at least 1').isInt({ min: 1 })
  ],
  validateRequest,
  createTable
);

router.put('/:id', 
  protect, 
  requireRole('admin'), 
  [
    body('capacity', 'Capacity must be at least 1').optional().isInt({ min: 1 }),
    body('isActive', 'isActive must be a boolean').optional().isBoolean()
  ],
  validateRequest,
  updateTable
);

module.exports = router;
