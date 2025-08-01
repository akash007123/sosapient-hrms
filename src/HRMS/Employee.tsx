import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  profile: string;
  department: string;
  email: string;
  role: string;
  mobile_no1: string;
  joining_date: string;
}

interface Department {
  _id: string;
  name: string;
  head: string;
}

const Employee: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // Add Employee Modal States
  const [addModal, setAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    mobile_no1: '',
    joining_date: '',
    password: '',
    profile: null as File | null,
  });
  
  // Edit Profile Modal States
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    mobile_no1: '',
    profile: null as File | null,
  });
  
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      setError('Error fetching employees');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/departments`, {
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
    fetchEmployees();
    fetchDepartments();
  }, [token]);

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    // If user is employee, they can only edit their own profile
    if (user?.role === 'employee' && employee._id !== user.id) {
      alert('You can only edit your own profile');
      return;
    }
    
    setEditFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department,
      mobile_no1: employee.mobile_no1,
      profile: null,
    });
    setSelectedEmployee(employee);
    setEditModal(true);
  };

  const handleDelete = (employee: Employee) => {
    if (!isAdmin) {
      alert('Only admins can delete employees');
      return;
    }
    setEmployeeToDelete(employee);
    setDeleteModal(true);
  };

  const handleAddEmployee = () => {
    if (!isAdmin) {
      alert('Only admins can add employees');
      return;
    }
    setAddFormData({
      first_name: '',
      last_name: '',
      email: '',
      department: '',
      mobile_no1: '',
      joining_date: '',
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

      // Add profile picture if selected
      if (addFormData.profile) {
        formData.append('profile', addFormData.profile);
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/employees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newEmployee = await response.json();
        setEmployees(prev => [...prev, newEmployee.employee]);
        setAddModal(false);
        setAddFormData({
          first_name: '',
          last_name: '',
          email: '',
          department: '',
          mobile_no1: '',
          joining_date: '',
          password: '',
          profile: null,
        });
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to add employee');
      }
    } catch (err) {
      setError('Error adding employee');
      console.error('Error:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
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

              const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(prev => prev.map(emp => 
          emp._id === selectedEmployee._id ? updatedEmployee.employee : emp
        ));
        setEditModal(false);
        setSelectedEmployee(null);
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
        setError(error.message || 'Failed to update employee');
      }
    } catch (err) {
      setError('Error updating employee');
      console.error('Error:', err);
    }
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
              const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/employees/${employeeToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setEmployees(employees.filter(emp => emp._id !== employeeToDelete._id));
        setDeleteModal(false);
        setEmployeeToDelete(null);
      } else {
        setError('Failed to delete employee');
      }
    } catch (err) {
      setError('Error deleting employee');
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
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Employee Management</h1>
          <p className="text-gray-600">Manage all employees in the organization</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{employees.filter(emp => emp.role === 'employee').length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{new Set(employees.map(emp => emp.department)).size}</p>
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
                  {employees.filter(emp => {
                    const joinDate = new Date(emp.joining_date);
                    const now = new Date();
                    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">EMPLOYEES LIST</h3>
                <p className="text-purple-100 text-sm mt-1">{employees.length} employees found</p>
              </div>
              {isAdmin && (
                <button 
                  onClick={handleAddEmployee}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  + Add Employee
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4">
              {error}
            </div>
          )}

<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Department</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Email</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Joining Date</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-100">
      {employees.map((employee) => (
        <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center space-x-4">
              {employee.profile && employee.profile.startsWith('/uploads/') ? (
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${employee.profile}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = 'fallback-image-url';
                  }}
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {employee.first_name?.charAt(0)?.toUpperCase() || 'E'}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {employee.first_name} {employee.last_name}
                </div>
                <div className="text-xs text-gray-500 capitalize">{employee.role}</div>
              </div>
            </div>
          </td>

          <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {employee.department || 'N/A'}
            </span>
          </td>

          <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">
            {employee.email}
          </td>

          <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">
            {formatDate(employee.joining_date)}
          </td>

          <td className="px-4 py-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleView(employee)}
                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                title="View"
              >
                <FontAwesomeIcon icon={faEye} />
              </button>
              <button
                onClick={() => handleEdit(employee)}
                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-100 transition-colors"
                title={user?.role === 'employee' ? 'Edit Profile' : 'Edit Employee'}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(employee)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


          {employees.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">No employees found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first employee to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* View Employee Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Employee Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <p className="text-gray-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{selectedEmployee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <p className="text-gray-900">{selectedEmployee.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <p className="text-gray-900 capitalize">{selectedEmployee.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-3">
                    {selectedEmployee.profile && selectedEmployee.profile.startsWith('/uploads/') ? (
                      <img 
                        src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.profile}`} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEMzE3M0YiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDUuODMzMzNDMTIuNzYxNCA1LjgzMzMzIDE1IDguMDcxOTMgMTUgMTAuODMzM0MxNSAxMy41OTQ3IDEyLjc2MTQgMTUuODMzMyAxMCAxNS44MzMzQzcuMjM4NTggMTUuODMzMyA1IDEzLjU5NDcgNSAxMC44MzMzQzUgOC4wNzE5MyA3LjIzODU4IDUuODMzMzMgMTAgNS44MzMzM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMCAxNy41QzEzLjIyMTcgMTcuNSAxNS44NzUgMTkuNzI5NyAxNi4yNSA0LjE2NjdDMTYuMjUgMy4yNSAxNS41IDIuNSAxNC41ODMzIDIuNUg1LjQxNjY3QzQuNSAyLjUgMy43NSA0LjE2NjcgMy43NSA1LjA4MzMzQzQuMTI1IDE5LjcyOTcgNi43NzgyNSAxNy41IDEwIDE3LjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {selectedEmployee.first_name?.charAt(0)?.toUpperCase() || 'E'}
                      </div>
                    )}
                    <span className="text-gray-600">Profile picture uploaded</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Joining Date</label>
                  <p className="text-gray-900">{formatDate(selectedEmployee.joining_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile</label>
                  <p className="text-gray-900">{selectedEmployee.mobile_no1 || 'N/A'}</p>
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

      {/* Add Employee Modal */}
      {addModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Add New Employee</h3>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Joining Date *</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={addFormData.joining_date}
                    onChange={handleAddFormChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    required
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {user?.role === 'employee' ? 'Edit Profile' : 'Edit Employee'}
              </h3>
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
                  Update {user?.role === 'employee' ? 'Profile' : 'Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && employeeToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-xl">
              <h3 className="text-xl font-bold text-white text-center">Delete Employee</h3>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{employeeToDelete.first_name} {employeeToDelete.last_name}</span>?
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
    </div>
  );
};

export default Employee;