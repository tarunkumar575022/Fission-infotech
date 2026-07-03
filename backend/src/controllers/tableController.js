const Table = require('../models/Table');
const { findAvailableTables } = require('../utils/availabilityChecker');

// @desc    Get all active tables
// @route   GET /api/tables
// @access  Private
const getTables = async (req, res) => {
  try {
    const query = req.user && req.user.role === 'admin' ? {} : { isActive: true };
    const tables = await Table.find(query);
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available tables
// @route   GET /api/tables/available
// @access  Private
const getAvailableTables = async (req, res) => {
  const { date, timeSlot, guests } = req.query;

  if (!date || !timeSlot || !guests) {
    return res.status(400).json({ success: false, message: 'Please provide date, timeSlot, and guests' });
  }

  try {
    const availableTables = await findAvailableTables(
      new Date(date),
      timeSlot,
      parseInt(guests, 10)
    );
    res.json({ success: true, data: availableTables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = async (req, res) => {
  const { tableNumber, capacity, description } = req.body;

  if (!tableNumber || !capacity) {
    return res.status(400).json({ success: false, message: 'Please provide tableNumber and capacity' });
  }

  try {
    const tableExists = await Table.findOne({ tableNumber });
    if (tableExists) {
      return res.status(400).json({ success: false, message: 'Table number already exists' });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      description,
    });

    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private/Admin
const updateTable = async (req, res) => {
  const { capacity, isActive, description } = req.body;

  try {
    const table = await Table.findById(req.params.id);

    if (table) {
      table.capacity = capacity !== undefined ? capacity : table.capacity;
      table.isActive = isActive !== undefined ? isActive : table.isActive;
      table.description = description || table.description;

      const updatedTable = await table.save();
      res.json({ success: true, data: updatedTable });
    } else {
      res.status(404).json({ success: false, message: 'Table not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTables,
  getAvailableTables,
  createTable,
  updateTable,
};
