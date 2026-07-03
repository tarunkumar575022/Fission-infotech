import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import AdminReservationRow from '../components/AdminReservationRow';
import { Settings, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { SkeletonCard, SkeletonRow } from '../components/Skeleton';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1); // Reset to page 1 on filter change
    fetchReservations();
  }, [filterDate, filterStatus]);

  useEffect(() => {
    fetchReservations();
  }, [page]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;

      const { data } = await api.get('/reservations', { params });
      setReservations(data.data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/reservations/${id}/cancel`);
      toast.success('Reservation cancelled successfully');
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/reservations/${id}/confirm`);
      toast.success('Reservation confirmed successfully');
      setReservations(prev => prev.map(res => res._id === id ? { ...res, status: 'confirmed' } : res));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm reservation');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this reservation?")) {
      try {
        await api.delete(`/reservations/${id}`);
        setReservations(prev => prev.filter(res => res._id !== id));
        toast.success('Reservation permanently deleted');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete reservation');
      }
    }
  };

  // Stats for the currently fetched day
  const totalRes = reservations.length;
  const confirmedRes = reservations.filter(r => r.status === 'confirmed').length;
  const cancelledRes = reservations.filter(r => r.status === 'cancelled').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of all restaurant reservations</p>
        </div>
        <Link to="/admin/tables" className="btn-secondary flex items-center gap-2">
          <Settings size={18} />
          Manage Tables
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="card-container border-t-4 border-t-primary flex items-center gap-4">
               <div className="p-3 bg-orange-50 rounded-lg text-primary"><BarChart2 size={32}/></div>
               <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Total (Selected Date)</p>
                  <p className="text-3xl font-bold text-gray-900">{totalRes}</p>
               </div>
            </div>
            <div className="card-container border-t-4 border-t-success flex items-center gap-4">
               <div className="p-3 bg-green-50 rounded-lg text-success"><CheckCircle size={32}/></div>
               <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Confirmed</p>
                  <p className="text-3xl font-bold text-gray-900">{confirmedRes}</p>
               </div>
            </div>
            <div className="card-container border-t-4 border-t-danger flex items-center gap-4">
               <div className="p-3 bg-red-50 rounded-lg text-danger"><XCircle size={32}/></div>
               <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Cancelled</p>
                  <p className="text-3xl font-bold text-gray-900">{cancelledRes}</p>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card-container py-4 flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filter by Date</label>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
        <div className="w-full sm:w-auto flex-grow flex justify-end">
           <button 
             onClick={() => { setFilterDate(''); setFilterStatus(''); setPage(1); }} 
             className="text-sm text-primary hover:underline font-medium"
           >
             Clear Filters
           </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Table</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Guests</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No reservations found for the selected filters.
                  </td>
                </tr>
              ) : (
                reservations.map(res => (
                  <AdminReservationRow 
                    key={res._id} 
                    reservation={res} 
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
