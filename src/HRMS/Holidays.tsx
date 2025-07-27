import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Holiday {
  _id: string;
  title: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

const Holidays: React.FC = () => {
  const { token, user } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', date: '' });

  // Fetch holidays from backend
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/holidays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHolidays(data.holidays || []);
      } else {
        setError('Failed to fetch holidays');
      }
    } catch (err) {
      setError('Error fetching holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    // eslint-disable-next-line
  }, [token]);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({ title: '', date: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (holiday: Holiday) => {
    setEditId(holiday._id);
    setForm({ title: holiday.title, date: holiday.date });
    setShowModal(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteId(id);
    setDeleteTitle(title);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/holidays/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setHolidays(holidays.filter(h => h._id !== deleteId));
        setDeleteId(null);
        setDeleteTitle('');
      } else {
        setError('Failed to delete holiday');
      }
    } catch (err) {
      setError('Error deleting holiday');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteTitle('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      // Edit holiday
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/holidays/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (response.ok) {
          const data = await response.json();
          setHolidays(holidays.map(h => h._id === editId ? data.holiday : h));
          setShowModal(false);
        } else {
          setError('Failed to update holiday');
        }
      } catch (err) {
        setError('Error updating holiday');
      }
    } else {
      // Add holiday
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/holidays`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (response.ok) {
          const data = await response.json();
          setHolidays([...holidays, data.holiday]);
          setShowModal(false);
        } else {
          setError('Failed to add holiday');
        }
      } catch (err) {
        setError('Error adding holiday');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Holidays</h1>
        <p className="text-gray-600">Manage company holidays and leave days</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <span className="text-white text-xl">🎉</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Holidays</p>
              <p className="text-2xl font-bold text-gray-900">{holidays.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <span className="text-white text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {holidays.filter(h => {
                  const holidayDate = new Date(h.date);
                  const now = new Date();
                  return holidayDate.getMonth() === now.getMonth() && 
                         holidayDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <span className="text-white text-xl">🎊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {holidays.filter(h => new Date(h.date) > new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
              <span className="text-white text-xl">📆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Year</p>
              <p className="text-2xl font-bold text-gray-900">
                {holidays.filter(h => {
                  const holidayDate = new Date(h.date);
                  const now = new Date();
                  return holidayDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar - Only show for admin */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Holiday List</h2>
              <p className="text-gray-600">Manage all company holidays</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
            >
              <span>+</span>
              Add Holiday
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Holidays Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Holiday
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 5 : 4} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <span className="text-4xl mb-4 block">🎉</span>
                      <p className="text-lg font-medium">No holidays found</p>
                      <p className="text-sm">Add your first holiday to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                holidays.map((holiday) => {
                  const holidayDate = new Date(holiday.date);
                  const now = new Date();
                  const isPast = holidayDate < now;
                  const isToday = holidayDate.toDateString() === now.toDateString();
                  
                  return (
                    <tr key={holiday._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {holiday.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {holidayDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(holiday.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isToday 
                            ? 'bg-green-100 text-green-800' 
                            : isPast 
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isToday ? 'Today' : isPast ? 'Past' : 'Upcoming'}
                        </span>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEdit(holiday)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(holiday._id, holiday.title)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal - Only show for admin */}
      {showModal && user?.role === 'admin' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {editId ? 'Edit Holiday' : 'Add Holiday'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Holiday Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    placeholder="Enter holiday title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  {editId ? 'Update Holiday' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Only show for admin */}
      {deleteId && user?.role === 'admin' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Delete Holiday</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the holiday "<strong>{deleteTitle}</strong>"?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200"
                >
                  Delete Holiday
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;