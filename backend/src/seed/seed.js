const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();
    await Table.deleteMany();
    await Reservation.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);

    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@tableflow.com', password: adminPassword, role: 'admin' },
      { name: 'Customer 1', email: 'customer1@tableflow.com', password: customerPassword, role: 'customer' },
      { name: 'Customer 2', email: 'customer2@tableflow.com', password: customerPassword, role: 'customer' },
    ]);

    const createdTables = await Table.insertMany([
      { tableNumber: 1, capacity: 2, description: 'couple/pair' },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4, description: 'small group' },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 4 },
      { tableNumber: 6, capacity: 6, description: 'medium group' },
      { tableNumber: 7, capacity: 6 },
      { tableNumber: 8, capacity: 8, description: 'large group' },
      { tableNumber: 9, capacity: 8 },
      { tableNumber: 10, capacity: 10, description: 'party/event' },
    ]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Reservation.insertMany([
      {
        customer: createdUsers[1]._id,
        table: createdTables[2]._id,
        reservationDate: tomorrow,
        timeSlot: '19:00',
        numberOfGuests: 4,
        status: 'confirmed'
      },
      {
        customer: createdUsers[2]._id,
        table: createdTables[0]._id,
        reservationDate: tomorrow,
        timeSlot: '20:00',
        numberOfGuests: 2,
        status: 'confirmed'
      }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
