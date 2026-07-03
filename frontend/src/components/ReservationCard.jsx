import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Users, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ReservationCard = ({ reservation, onCancel }) => {
  const isFuture = new Date(reservation.reservationDate) >= new Date().setHours(0, 0, 0, 0);
  const canCancel = reservation.status === 'confirmed' && isFuture;

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.patch(`/reservations/${reservation._id}/cancel`);
        toast.success('Reservation cancelled successfully');
        onCancel(reservation._id);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel reservation');
      }
    }
  };

  return (
    <div className="card-container flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-primary hover:shadow-md transition-shadow">
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-900">Table {reservation.table?.tableNumber}</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              reservation.status === 'confirmed'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {reservation.status}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
            <Calendar size={16} className="text-primary" />
            <span>{format(new Date(reservation.reservationDate), 'EEE, MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
            <Clock size={16} className="text-primary" />
            <span>{reservation.timeSlot}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
            <Users size={16} className="text-primary" />
            <span>{reservation.numberOfGuests} Guests</span>
          </div>
        </div>
        
        {reservation.notes && (
          <p className="text-sm text-gray-500 italic mt-2">"{reservation.notes}"</p>
        )}
      </div>

      {canCancel && (
        <button
          onClick={handleCancel}
          className="btn-danger flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <XCircle size={18} />
          Cancel Booking
        </button>
      )}
    </div>
  );
};

export default ReservationCard;
