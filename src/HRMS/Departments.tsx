import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Department {
  _id: string;
  name: string;
  head: string;
  totalEmployees?: number;
  description?: string;
}

const Departments: React.FC = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', head: '', description: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch departments from backend
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      console.log('Departments: Fetching with token:', token ? 'Present' : 'Missing');
      console.log('Departments: API URL:', `${import.meta.env.VITE_BASE_URL}/api/departments`);
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Departments: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Departments: Error response:', errorData);
        setError('Failed to fetch departments');
      }
    } catch (err) {
      console.error('Departments: Fetch error:', err);
      setError('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line
  }, [token]);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({ name: '', head: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditId(dept._id);
    setForm({ name: dept.name, head: dept.head, description: dept.description || '' });
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/departments/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setDepartments(departments.filter(d => d._id !== deleteId));
        setDeleteId(null);
        setDeleteName('');
      } else {
        setError('Failed to delete department');
      }
    } catch (err) {
      setError('Error deleting department');
    }
  };
  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteName('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      // Edit department
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/departments/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (response.ok) {
          const data = await response.json();
          setDepartments(departments.map(d => d._id === editId ? data.department : d));
          setShowModal(false);
        } else {
          setError('Failed to update department');
        }
      } catch (err) {
        setError('Error updating department');
      }
    } else {
      // Add department
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/departments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (response.ok) {
          const data = await response.json();
          setDepartments([...departments, data.department]);
          setShowModal(false);
        } else {
          setError('Failed to add department');
        }
      } catch (err) {
        setError('Error adding department');
      }
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
        <button onClick={handleOpenAdd} className="bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-purple-800 transition">
          <span className="text-lg font-semibold">+ Add</span>
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex gap-4 sm:gap-8 border-b mb-4 overflow-x-auto">
          <button
            className={`pb-2 font-semibold whitespace-nowrap ${view === 'list' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-400'}`}
            onClick={() => setView('list')}
          >
            List View
          </button>
          <button
            className={`pb-2 font-semibold whitespace-nowrap ${view === 'grid' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-400'}`}
            onClick={() => setView('grid')}
          >
            Grid View
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading departments...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : departments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No departments found.</div>
        ) : view === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm md:text-base">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-2 sm:px-4">#</th>
                  <th className="py-2 px-2 sm:px-4">DEPARTMENT NAME</th>
                  <th className="py-2 px-2 sm:px-4">DEPARTMENT HEAD</th>
                  <th className="py-2 px-2 sm:px-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => (
                  <tr key={dept._id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-2 sm:px-4 align-middle">{idx + 1}</td>
                    <td className="py-2 px-2 sm:px-4 align-middle font-medium text-gray-700">{dept.name}</td>
                    <td className="py-2 px-2 sm:px-4 align-middle">{dept.head}</td>
                    <td className="py-2 px-2 sm:px-4 flex gap-2 items-center">
                      <button onClick={() => handleOpenEdit(dept)} title="Edit" className="text-purple-700 hover:bg-purple-100 p-1 rounded transition">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(dept._id, dept.name)} title="Delete" className="text-red-500 hover:bg-red-100 p-1 rounded transition">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm2-10V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-4">
            {departments.map((dept, idx) => (
              <div key={dept._id} className="bg-gray-50 rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-purple-700">{dept.name}</span>
                </div>
                <div className="text-gray-700 flex flex-col gap-1">
                  <span><span className="font-semibold">Head:</span> {dept.head}</span>
                  {dept.description && <span><span className="font-semibold">Description:</span> {dept.description}</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleOpenEdit(dept)} title="Edit" className="text-purple-700 hover:bg-purple-100 p-2 rounded transition flex-1">Edit</button>
                  <button onClick={() => handleDelete(dept._id, dept.name)} title="Delete" className="text-red-500 hover:bg-red-100 p-2 rounded transition flex-1">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-2">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md mx-auto animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{editId ? 'Edit Department' : 'Add Department'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Department Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Department Head</label>
                <input name="head" value={form.head} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded-lg" rows={2} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition">{editId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-2">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mx-auto animate-fadeIn">
            <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Delete Department</h3>
            <p className="mb-6 text-center text-gray-700">Are you sure you want to delete <span className="font-semibold">{deleteName}</span>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;