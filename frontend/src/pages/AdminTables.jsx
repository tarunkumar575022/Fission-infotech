import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus } from 'lucide-react';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Table Form
  const [showAdd, setShowAdd] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data.sort((a, b) => a.tableNumber - b.tableNumber));
    } catch (error) {
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (table) => {
    try {
      const res = await api.put(`/tables/${table._id}`, { isActive: !table.isActive });
      setTables(tables.map(t => t._id === table._id ? res.data.data : t));
      toast.success(`Table ${table.tableNumber} is now ${!table.isActive ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error('Failed to update table status');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tables', { 
        tableNumber: parseInt(newNumber), 
        capacity: parseInt(newCapacity),
        description: newDesc
      });
      setTables([...tables, res.data.data].sort((a, b) => a.tableNumber - b.tableNumber));
      setShowAdd(false);
      setNewNumber('');
      setNewCapacity('');
      setNewDesc('');
      toast.success('Table added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add table');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Tables</h1>
          <p className="text-gray-500">Add or update restaurant tables</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Table
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card-container bg-orange-50 border-orange-100 flex flex-wrap gap-4 items-end">
          <div className="w-24">
             <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Number</label>
             <input type="number" min="1" required value={newNumber} onChange={e=>setNewNumber(e.target.value)} className="input-field" placeholder="e.g. 11" />
          </div>
          <div className="w-24">
             <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Capacity</label>
             <input type="number" min="1" required value={newCapacity} onChange={e=>setNewCapacity(e.target.value)} className="input-field" placeholder="e.g. 4" />
          </div>
          <div className="flex-1 min-w-[200px]">
             <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description (Optional)</label>
             <input type="text" value={newDesc} onChange={e=>setNewDesc(e.target.value)} className="input-field" placeholder="e.g. window seat" />
          </div>
          <button type="submit" className="btn-primary h-[42px] px-6">Save</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
           <div className="col-span-full flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          tables.map(table => (
            <div key={table._id} className={`card-container flex flex-col justify-between ${!table.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-primary">T{table.tableNumber}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {table.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-gray-600 font-medium mb-1">Capacity: {table.capacity}</div>
                {table.description && <div className="text-sm text-gray-400 italic">{table.description}</div>}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => toggleStatus(table)}
                  className={`w-full py-2 rounded font-medium transition-colors text-sm ${
                    table.isActive ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-primary text-white hover:opacity-90'
                  }`}
                >
                  Mark as {table.isActive ? 'Inactive' : 'Active'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTables;
