import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile?: string;
  department?: string;
}

interface Leave {
  _id: string;
  employee_id: Employee;
  from_date: string;
  to_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  is_half_day: boolean;
  created_by: {
    _id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface LeaveStats {
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  cancelledLeaves: number;
}

// Profile Image Component
const ProfileImage: React.FC<{
  profile?: string;
  firstName: string;
  lastName: string;
  className?: string;
}> = ({ profile, firstName, lastName, className = "w-8 h-8 rounded-full object-cover" }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (profile && profile.startsWith('http')) {
      setImageSrc(profile);
    } else if (profile) {
      // Handle both relative paths (starting with /) and just filenames
      const profilePath = profile.startsWith('/') 
        ? `${import.meta.env.VITE_BASE_URL}${profile}`
        : `${import.meta.env.VITE_BASE_URL}/uploads/profiles/${profile}`;
      setImageSrc(profilePath);
    } else {
      const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=32`;
      setImageSrc(initialsUrl);
    }
  }, [profile, firstName, lastName]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=32`;
      setImageSrc(initialsUrl);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={`${firstName} ${lastName}`}
      className={className}
      title={`${firstName} ${lastName}`}
      onError={handleError}
    />
  );
};

const Leaves: React.FC = () => {
  const { token, user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<LeaveStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    cancelledLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [form, setForm] = useState({
    employee_id: '',
    from_date: '',
    to_date: '',
    reason: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'cancelled',
    is_half_day: false
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    employee_id: '',
    from_date: '',
    to_date: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch leaves data
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Add pagination
      params.append('page', pagination.currentPage.toString());
      params.append('limit', pagination.itemsPerPage.toString());
      
      // Add role-based filtering
      if (user?.role === 'employee') {
        params.append('logged_in_employee_id', user.id);
        params.append('role', user.role);
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves || []);
        setPagination(data.pagination || pagination);
      } else {
        setError('Failed to fetch leaves');
      }
    } catch (err) {
      setError('Error fetching leaves');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves/dropdown/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch leave statistics
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.role === 'employee') {
        params.append('logged_in_employee_id', user.id);
        params.append('role', user.role);
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves/stats?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchStats();
    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [token, user, filters, pagination.currentPage]);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      employee_id: '',
      from_date: '',
      to_date: '',
      reason: '',
      status: 'pending',
      is_half_day: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (leave: Leave) => {
    setEditId(leave._id);
    setForm({
      employee_id: leave.employee_id._id,
      from_date: leave.from_date.split('T')[0],
      to_date: leave.to_date.split('T')[0],
      reason: leave.reason,
      status: leave.status,
      is_half_day: leave.is_half_day
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, reason: string) => {
    setDeleteId(id);
    setDeleteReason(reason);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setLeaves(leaves.filter(l => l._id !== deleteId));
        setDeleteId(null);
        setDeleteReason('');
        fetchStats(); // Refresh stats
      } else {
        setError('Failed to delete leave');
      }
    } catch (err) {
      setError('Error deleting leave');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteReason('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId 
        ? `${import.meta.env.VITE_BASE_URL}/api/leaves/${editId}`
        : `${import.meta.env.VITE_BASE_URL}/api/leaves`;
      
      const method = editId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        if (editId) {
          setLeaves(leaves.map(l => l._id === editId ? data.leave : l));
        } else {
          setLeaves([data.leave, ...leaves]);
        }
        setShowModal(false);
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save leave');
      }
    } catch (err) {
      setError('Error saving leave');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
        <p className="text-gray-600">Manage employee leave requests and approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {[
          { label: 'Total Leaves', value: stats.totalLeaves, color: 'bg-blue-500' },
          { label: 'Pending', value: stats.pendingLeaves, color: 'bg-yellow-500' },
          { label: 'Approved', value: stats.approvedLeaves, color: 'bg-green-500' },
          { label: 'Rejected', value: stats.rejectedLeaves, color: 'bg-red-500' },
          { label: 'Cancelled', value: stats.cancelledLeaves, color: 'bg-gray-500' }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <span className="text-white text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar - Only show for admin */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
              <p className="text-gray-600">Manage all leave requests</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
            >
              <span>+</span>
              Add Leave Request
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search by reason..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                name="employee_id"
                value={filters.employee_id}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

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

      {/* Leaves Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
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
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <span className="text-4xl mb-4 block">📅</span>
                      <p className="text-lg font-medium">No leaves found</p>
                      <p className="text-sm">Add your first leave request to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ProfileImage
                            profile={leave.employee_id.profile}
                            firstName={leave.employee_id.first_name}
                            lastName={leave.employee_id.last_name}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {leave.employee_id.first_name} {leave.employee_id.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {leave.employee_id.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {leave.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          leave.is_half_day ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {leave.is_half_day ? 'Half Day' : 'Full Day'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEdit(leave)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(leave._id, leave.reason)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === pagination.currentPage
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {editId ? 'Edit Leave Request' : 'Add Leave Request'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Employee *
                    </label>
                    <select
                      name="employee_id"
                      value={form.employee_id}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.first_name} {employee.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Date *
                    </label>
                    <input
                      type="date"
                      name="from_date"
                      value={form.from_date}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To Date *
                    </label>
                    <input
                      type="date"
                      name="to_date"
                      value={form.to_date}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    placeholder="Enter leave reason"
                    required
                  />
                </div>
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_half_day"
                      checked={form.is_half_day}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Half Day</span>
                  </label>
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
                  {editId ? 'Update Leave' : 'Add Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Delete Leave Request</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the leave request for "<strong>{deleteReason}</strong>"?
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
                  Delete Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves; 