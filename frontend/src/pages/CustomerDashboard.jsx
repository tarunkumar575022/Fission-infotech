import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ReservationCard from '../components/ReservationCard';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonRow } from '../components/Skeleton';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/my');
      setReservations(res.data.data);
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpdate = (id) => {
    setReservations(reservations.map(res => 
      res._id === id ? { ...res, status: 'cancelled' } : res
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name.split(' ')[0]}! 🍽️</h1>
          <p className="text-gray-500 mt-1">Manage your dining experiences</p>
        </div>
        <Link to="/reserve" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <PlusCircle size={20} />
          Make New Reservation
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          My Reservations
          <span className="bg-orange-100 text-primary text-sm py-0.5 px-2.5 rounded-full font-bold">
            {reservations.length}
          </span>
        </h2>
        
        <div className="space-y-4">
          {loading ? (
            <>
              <div className="card-container border-t-4 border-t-gray-200 h-24 animate-pulse bg-gray-100"></div>
              <div className="card-container border-t-4 border-t-gray-200 h-24 animate-pulse bg-gray-100"></div>
              <div className="card-container border-t-4 border-t-gray-200 h-24 animate-pulse bg-gray-100"></div>
            </>
          ) : reservations.length > 0 ? (
            reservations.map((reservation) => (
              <ReservationCard 
                key={reservation._id} 
                reservation={reservation} 
                onCancel={handleCancelUpdate}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No reservations yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't booked any tables yet. Ready for a great meal?</p>
              <Link to="/reserve" className="btn-primary">Book a Table Now</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
