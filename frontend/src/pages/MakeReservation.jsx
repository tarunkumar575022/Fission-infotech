import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00'
];

const formatTime = (time) => {
  const [hour, min] = time.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${min} ${ampm}`;
};

const MakeReservation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);

  // Form Data
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [guestName, setGuestName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const checkAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`/tables/available?date=${date}&timeSlot=${timeSlot}&guests=${guests}`);
      setAvailableTables(res.data.data);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const confirmReservation = async () => {
    setLoading(true);
    try {
      await api.post('/reservations', {
        tableId: selectedTable._id,
        reservationDate: date,
        timeSlot,
        numberOfGuests: guests,
        specialRequests,
        guestName,
        mobileNumber
      });
      toast.success('Reservation confirmed!');
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 409) {
         toast.error('This table was just booked by someone else! Please select another.');
         setStep(1); // Go back to check again
      } else {
         toast.error(error.response?.data?.message || 'Failed to make reservation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book a Table</h1>
        <p className="text-gray-500 mt-2">Reserve your spot for an amazing experience</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center items-center mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
              step >= s ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card-container min-h-[400px]">
        {/* STEP 1: Select Details */}
        {step === 1 && (
          <form onSubmit={checkAvailability} className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
               <Calendar className="text-primary"/> Select Date & Time
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="" disabled>Select a time</option>
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                 <Users size={16} /> Number of Guests
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="input-field w-full md:w-1/2"
                required
              />
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading || !date || !timeSlot || !guests}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                {loading ? 'Checking...' : 'Check Availability'} <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Select Table */}
        {step === 2 && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                   <CheckCircle2 className="text-primary"/> Select Available Table
                </h2>
                <button onClick={() => setStep(1)} className="text-primary hover:underline text-sm font-medium">
                   Change Search
                </button>
             </div>
            
            <div className="bg-orange-50 text-orange-800 p-4 rounded-lg mb-6 flex gap-4 text-sm font-medium border border-orange-100">
               <span>📅 {format(new Date(date), 'MMM d, yyyy')}</span>
               <span>🕒 {formatTime(timeSlot)}</span>
               <span>👥 {guests} Guests</span>
            </div>

            {availableTables.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No tables available for selected date, time and guests.</p>
                <button onClick={() => setStep(1)} className="btn-secondary">Try Different Time</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableTables.map((table) => (
                  <div 
                    key={table._id} 
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary cursor-pointer transition-colors flex flex-col items-center text-center group"
                    onClick={() => { setSelectedTable(table); setStep(3); }}
                  >
                    <div className="w-16 h-16 bg-orange-100 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-3 group-hover:scale-110 transition-transform">
                       T{table.tableNumber}
                    </div>
                    <h3 className="font-semibold text-gray-800">Table {table.tableNumber}</h3>
                    <p className="text-sm text-gray-500 mt-1">Capacity: {table.capacity} persons</p>
                    {table.description && <p className="text-xs text-gray-400 mt-1">{table.description}</p>}
                    
                    <button className="mt-4 px-4 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-full w-full group-hover:bg-primary group-hover:text-white transition-colors">
                       Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                   🎉 Confirm Reservation
                </h2>
                <button onClick={() => setStep(2)} className="text-primary hover:underline text-sm font-medium">
                   Change Table
                </button>
             </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Time</p>
                  <p className="font-semibold text-gray-900">{formatTime(timeSlot)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Guests</p>
                  <p className="font-semibold text-gray-900">{guests} People</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Table Selection</p>
                  <p className="font-semibold text-primary">Table {selectedTable?.tableNumber}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="input-field"
                    placeholder="e.g. +1 234 567 8900"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests / Notes (Optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="e.g. Birthday celebration, allergy info..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button onClick={() => setStep(2)} className="btn-secondary" disabled={loading}>
                 Back
              </button>
              <button
                onClick={confirmReservation}
                disabled={loading}
                className="btn-primary px-8 py-3 text-lg"
              >
                {loading ? 'Confirming...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeReservation;
