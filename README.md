# TableFlow - Restaurant Reservation Management System

TableFlow is a full-stack MERN application designed to manage restaurant table reservations efficiently, providing both customer-facing functionality and administrative controls.

**Live Demo:** [Insert Vercel/Render URL Here]

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/tableflow
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRES_IN=2h
   NODE_ENV=development
   ```
4. **Seed the database** (Creates default tables and admin/customer test accounts):
   ```bash
   node src/seed/seed.js
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Assumptions Made
1. **Single Restaurant Model:** The system assumes all tables belong to a single physical restaurant location.
2. **Fixed Time Slots:** Reservations are booked in fixed, predefined hourly slots (e.g., 18:00, 19:00, 20:00) rather than allowing arbitrary minute-level selections.
3. **Table Seating Capacity:** A customer can only book a table if the table's maximum capacity is greater than or equal to their requested number of guests.
4. **Day-of Booking Cutoffs:** Customers cannot cancel reservations that are in the past.

## Explanation of Reservation and Availability Logic
To prevent double bookings and capacity conflicts, the system uses a robust backend utility (`availabilityChecker.js`):
1. When a user requests a booking, the backend queries the database for all `active` tables where `capacity >= numberOfGuests`.
2. It then searches for any existing `confirmed` reservations for the requested `reservationDate` and `timeSlot`.
3. It filters out any tables that are already booked for that specific time, returning an array of truly available tables.
4. If an admin attempts to "Confirm" a previously cancelled reservation, this exact same logic is re-run to guarantee the table wasn't taken by someone else in the meantime (returning a 409 Conflict if it was).

## Explanation of Role-Based Access (User vs Admin)
The system utilizes JWT (JSON Web Tokens) with encoded role information (`customer` or `admin`):
- **Backend Protection:** A custom Express middleware `requireRole('admin')` intercepts incoming requests. If the JWT payload does not contain the `admin` role, the API rejects the request with a `403 Forbidden` status.
- **Frontend Protection:** A React `<ProtectedRoute>` wrapper surrounds the React Router routes. If a standard customer tries to navigate to `/admin`, they are immediately redirected back to their own dashboard.
- **Resource Ownership:** Customers can only view and cancel their *own* reservations. The backend validates that `req.user._id` matches the reservation's `customer` ID before processing cancellations.

## Known Limitations
- **No Real-Time Sockets:** If two customers are viewing the exact same available table on their screens, and one books it, the other customer's screen won't update until they refresh or attempt to book (at which point the API will correctly reject the second attempt).
- **Time Zones:** The system currently relies on the browser/server's local time zone, which assumes the restaurant and the customers are in the same time zone.

## Data Modeling & Design Decisions
The MongoDB schema is designed relationally using `ObjectId` references to ensure data integrity:
- **User Schema:** Stores authentication data and uses a `role` enum (`customer`, `admin`) to handle permissions at the database level.
- **Table Schema:** Represents physical restaurant tables. Contains `tableNumber` and `capacity`. By keeping this separate, the restaurant floor plan can be dynamically reconfigured without hardcoding capacities into the frontend.
- **Reservation Schema:** The core transaction document. It links the `customer` (User ObjectId) and the `table` (Table ObjectId). It explicitly tracks `reservationDate`, `timeSlot`, and `numberOfGuests`. It also includes an `isDeleted` flag for soft-deleting records to preserve audit history.

## API Documentation
The backend provides a fully RESTful API. Below are the key endpoints:

### Authentication
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/login` - Authenticate user & get JWT

### Reservations
- `POST /api/reservations` - Create a new reservation (Customer)
- `GET /api/reservations/my-reservations` - Get own reservations (Customer)
- `GET /api/reservations` - Get all reservations with pagination/filters (Admin)
- `DELETE /api/reservations/:id` - Soft delete a reservation (Admin)
- `PATCH /api/reservations/:id/cancel` - Cancel a reservation (Customer/Admin)
- `PATCH /api/reservations/:id/confirm` - Re-confirm a reservation (Admin)

### Tables
- `GET /api/tables` - Get all tables (Admin)
- `GET /api/tables/available` - Get tables available for a specific date/time/capacity
- `POST /api/tables` - Create a new table (Admin)

## Areas for improvement with additional time
If I had more time to work on this project, I would implement the following improvements for a production environment:

1. **Pagination:** Right now the Admin Dashboard loads all reservations at once. I would add "pages" (like Page 1, Page 2) so the browser doesn't slow down if the restaurant gets 10,000 reservations over a year.
2. **Soft Deleting:** When an admin deletes a reservation, it is permanently erased from the database. In the real world, businesses usually want to keep a hidden record of deleted data for financial auditing. I would add an `isDeleted` flag instead of permanently erasing the data.
3. **Database Transactions:** To guarantee absolute atomicity in a highly concurrent environment, I would wrap the availability check and the reservation creation in a MongoDB Session/Transaction. This prevents race conditions at the database level.
