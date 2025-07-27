import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Admin {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department: string;
  mobile_no1?: string;
  profile?: string;
  created_at?: string;
}

interface Department {
  _id: string;
  name: string;
  head: string;
}

const Users: React.FC = () => {
  const { token } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  
  // Add Admin Modal States
  const [addModal, setAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    mobile_no1: '',
    password: '',
    profile: null as File | null,
  });
  
  // Edit Admin Modal States
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    mobile_no1: '',
    profile: null as File | null,
  });

  // Fetch admins from backend
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/hrms/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      } else {
        setError('Failed to fetch admins');
      }
    } catch (err) {
      setError('Error fetching admins');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchDepartments();
  }, [token]);

  const handleView = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditFormData({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      department: admin.department,
      mobile_no1: admin.mobile_no1 || '',
      profile: null,
    });
    setSelectedAdmin(admin);
    setEditModal(true);
  };

  const handleDelete = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteModal(true);
  };

  const handleAddAdmin = () => {
    setAddFormData({
      first_name: '',
      last_name: '',
      email: '',
      department: '',
      mobile_no1: '',
      password: '',
      profile: null,
    });
    setAddModal(true);
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    setAddFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    setEditFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(addFormData).forEach(key => {
        if (key !== 'profile' && addFormData[key as keyof typeof addFormData]) {
          formData.append(key, addFormData[key as keyof typeof addFormData] as string);
        }
      });

      // Add role
      formData.append('role', 'admin');

      // Add profile picture if selected
      if (addFormData.profile) {
        formData.append('profile', addFormData.profile);
      }

      const response = await fetch('http://localhost:5000/api/hrms/admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newAdmin = await response.json();
        setAdmins(prev => [...prev, newAdmin.admin]);
        setAddModal(false);
        setAddFormData({
          first_name: '',
          last_name: '',
          email: '',
          department: '',
          mobile_no1: '',
          password: '',
          profile: null,
        });
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to add admin');
      }
    } catch (err) {
      setError('Error adding admin');
      console.error('Error:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    try {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(editFormData).forEach(key => {
        if (key !== 'profile' && editFormData[key as keyof typeof editFormData]) {
          formData.append(key, editFormData[key as keyof typeof editFormData] as string);
        }
      });

      // Add profile picture if selected
      if (editFormData.profile) {
        formData.append('profile', editFormData.profile);
      }

      const response = await fetch(`http://localhost:5000/api/hrms/admins/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedAdmin = await response.json();
        setAdmins(prev => prev.map(admin => 
          admin._id === selectedAdmin._id ? updatedAdmin.admin : admin
        ));
        setEditModal(false);
        setSelectedAdmin(null);
        setEditFormData({
          first_name: '',
          last_name: '',
          email: '',
          department: '',
          mobile_no1: '',
          profile: null,
        });
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to update admin');
      }
    } catch (err) {
      setError('Error updating admin');
      console.error('Error:', err);
    }
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/hrms/admins/${adminToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAdmins(admins.filter(admin => admin._id !== adminToDelete._id));
        setDeleteModal(false);
        setAdminToDelete(null);
      } else {
        setError('Failed to delete admin');
      }
    } catch (err) {
      setError('Error deleting admin');
      console.error('Error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Admin Management</h1>
          <p className="text-gray-600">Manage all administrators in the system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{admins.filter(admin => admin.role === 'admin').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(admins.map(admin => admin.department)).size}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(admin => {
                    const createdDate = new Date(admin.created_at || '');
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">ADMINS LIST</h3>
                <p className="text-purple-100 text-sm mt-1">{admins.length} admins found</p>
              </div>
              <button 
                onClick={handleAddAdmin}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                + Add Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <div className="flex items-center">
                        {admin.profile && admin.profile.startsWith('/uploads/') ? (
                          <img 
                            src={`http://localhost:5000${admin.profile}`} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEMzE3M0YiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDUuODMzMzNDMTIuNzYxNCA1LjgzMzMzIDE1IDguMDcxOTMgMTUgMTAuODMzM0MxNSAxMy41OTQ3IDEyLjc2MTQgMTUuODMzMyAxMCAxNS44MzMzQzcuMjM4NTggMTUuODMzMyA1IDEzLjU5NDcgNSAxMC44MzMzQzUgOC4wNzE5MyA3LjIzODU4IDUuODMzMzMgMTAgNS44MzMzM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMCAxNy41QzEzLjIyMTcgMTcuNSAxNS44NzUgMTkuNzI5NyAxNi4yNSA0LjE2NjdDMTYuMjUgMy4yNSAxNS41IDIuNSAxNC41ODMzIDIuNUg1LjQxNjY3QzQuNSAyLjUgMy43NSA0LjE2NjcgMy43NSA1LjA4MzMzQzQuMTI1IDE5LjcyOTcgNi43NzgyNSAxNy41IDEwIDE3LjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {admin.first_name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {admin.first_name} {admin.last_name}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {admin.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {admin.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(admin)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Admin"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit Admin"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Admin"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {admins.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">No admins found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first admin to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {addModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Add New Admin</h3>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={addFormData.first_name}
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={addFormData.last_name}
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={addFormData.email}
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                  <select
                    name="department"
                    value={addFormData.department}
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name} - {dept.head}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile_no1"
                    value={addFormData.mobile_no1}
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={addFormData.password}
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                  <input
                    type="file"
                    name="profile"
                    accept="image/*"
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                  {addFormData.profile && (
                    <p className="text-sm text-gray-500 mt-1">Selected: {addFormData.profile.name}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && adminToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white text-center">Delete Admin</h3>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{adminToDelete.first_name} {adminToDelete.last_name}</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Admin Modal */}
      {showModal && selectedAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Admin Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <p className="text-gray-900">{selectedAdmin.first_name} {selectedAdmin.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{selectedAdmin.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <p className="text-gray-900">{selectedAdmin.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <p className="text-gray-900 capitalize">{selectedAdmin.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-3">
                    {selectedAdmin.profile && selectedAdmin.profile.startsWith('/uploads/') ? (
                      <img 
                        src={`http://localhost:5000${selectedAdmin.profile}`} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEMzE3M0YiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDUuODMzMzNDMTIuNzYxNCA1LjgzMzMzIDE1IDguMDcxOTMgMTUgMTAuODMzM0MxNSAxMy41OTQ3IDEyLjc2MTQgMTUuODMzMyAxMCAxNS44MzMzQzcuMjM4NTggMTUuODMzMyA1IDEzLjU5NDcgNSAxMC44MzMzQzUgOC4wNzE5MyA3LjIzODU4IDUuODMzMzMgMTAgNS44MzMzM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMCAxNy41QzEzLjIyMTcgMTcuNSAxNS44NzUgMTkuNzI5NyAxNi4yNSA0LjE2NjdDMTYuMjUgMy4yNSAxNS41IDIuNSAxNC41ODMzIDIuNUg1LjQxNjY3QzQuNSAyLjUgMy43NSA0LjE2NjcgMy43NSA1LjA4MzMzQzQuMTI1IDE5LjcyOTcgNi43NzgyNSAxNy41IDEwIDE3LjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {selectedAdmin.first_name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <span className="text-gray-600">Profile picture uploaded</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Created Date</label>
                  <p className="text-gray-900">{formatDate(selectedAdmin.created_at || '')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile</label>
                  <p className="text-gray-900">{selectedAdmin.mobile_no1 || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editModal && selectedAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Edit Admin</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editFormData.first_name}
                    onChange={handleEditFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editFormData.last_name}
                    onChange={handleEditFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                  <select
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name} - {dept.head}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile_no1"
                    value={editFormData.mobile_no1}
                    onChange={handleEditFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                  <input
                    type="file"
                    name="profile"
                    accept="image/*"
                    onChange={handleEditFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                  {editFormData.profile && (
                    <p className="text-sm text-gray-500 mt-1">Selected: {editFormData.profile.name}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  Update Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 