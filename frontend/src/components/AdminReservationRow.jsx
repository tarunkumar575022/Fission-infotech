import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash } from 'lucide-react';

const AdminReservationRow = ({ reservation, onCancel, onConfirm, onDelete }) => {
  const [loading, setLoading] = useState(false);

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
      <td className="p-4 align-top">
        <p className="font-semibold text-gray-800">{reservation.guestName || reservation.customer?.name}</p>
        <p className="text-sm text-gray-500">{reservation.customer?.email}</p>
        {reservation.mobileNumber && <p className="text-sm text-primary font-medium mt-0.5">📞 {reservation.mobileNumber}</p>}
      </td>
      <td className="p-4 align-top">
        <span className="font-semibold text-primary">T{reservation.table?.tableNumber}</span>
      </td>
      <td className="p-4 text-sm text-gray-700">
        <div>{format(new Date(reservation.reservationDate), 'MMM d, yyyy')}</div>
        <div className="text-gray-500">{reservation.timeSlot}</div>
      </td>
      <td className="p-4 text-center text-sm font-medium">
        {reservation.numberOfGuests}
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
          reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {reservation.status}
        </span>
      </td>
      <td className="p-4 align-top">
        <div className="flex gap-2">
          {reservation.status === 'confirmed' ? (
            <button 
              onClick={async () => { setLoading(true); await onCancel(reservation._id); setLoading(false); }}
              disabled={loading}
              className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Cancel'}
            </button>
          ) : (
            <button 
              onClick={async () => { setLoading(true); await onConfirm(reservation._id); setLoading(false); }}
              disabled={loading}
              className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          )}
          <button 
            onClick={async () => { setLoading(true); await onDelete(reservation._id); setLoading(false); }}
            disabled={loading}
            className="text-red-600 border border-red-200 hover:bg-red-600 hover:text-white p-1.5 rounded transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Delete Reservation"
          >
            <Trash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminReservationRow;
