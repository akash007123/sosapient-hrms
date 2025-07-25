import React, { useState } from 'react';

interface Department {
  id: number;
  name: string;
  head: string;
  totalEmployees: number;
}

const initialDepartments: Department[] = [
  { id: 1, name: 'Web Developer', head: 'Prolifics', totalEmployees: 11 },
  { id: 2, name: 'Web Designer', head: 'Prolifics', totalEmployees: 7 },
  { id: 3, name: 'QA Engineer', head: 'Prolifics', totalEmployees: 2 },
  { id: 4, name: 'Business Analyst', head: 'Prolifics', totalEmployees: 0 },
];

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', head: '', totalEmployees: 0 });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({ name: '', head: '', totalEmployees: 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditId(dept.id);
    setForm({ name: dept.name, head: dept.head, totalEmployees: dept.totalEmployees });
    setShowModal(true);
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };
  const confirmDelete = () => {
    setDepartments(departments.filter(d => d.id !== deleteId));
    setDeleteId(null);
    setDeleteName('');
  };
  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteName('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'totalEmployees' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setDepartments(departments.map(d => d.id === editId ? { ...d, ...form } : d));
    } else {
      setDepartments([
        ...departments,
        { id: departments.length ? Math.max(...departments.map(d => d.id)) + 1 : 1, ...form },
      ]);
    }
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Departments</h2>
        <button onClick={handleOpenAdd} className="bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2">
          + Add
        </button>
      </div>
      <div className="bg-white rounded shadow p-6">
        <div className="flex gap-8 border-b mb-4">
          <button className="pb-2 border-b-2 border-purple-700 font-semibold">List View</button>
          <button className="pb-2 text-gray-400">Grid View</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">DEPARTMENT NAME</th>
                <th className="py-2 px-4">DEPARTMENT HEAD</th>
                <th className="py-2 px-4">TOTAL EMPLOYEE</th>
                <th className="py-2 px-4">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, idx) => (
                <tr key={dept.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4">{idx + 1}</td>
                  <td className="py-2 px-4">{dept.name}</td>
                  <td className="py-2 px-4">{dept.head}</td>
                  <td className="py-2 px-4">{dept.totalEmployees}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={() => handleOpenEdit(dept)} title="Edit" className="text-purple-700 hover:underline">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(dept.id, dept.name)} title="Delete" className="text-red-500 hover:underline">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm2-10V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editId ? 'Edit Department' : 'Add Department'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Department Name</label>
                <select name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required>
                  <option value="">Select Department</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Web Designer">Web Designer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Business Analyst">Business Analyst</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Department Head</label>
                <input name="head" value={form.head} onChange={handleChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Total Employee</label>
                <input name="totalEmployees" type="number" value={form.totalEmployees} onChange={handleChange} className="w-full p-2 border rounded" min={0} required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded">{editId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-center">Delete Department</h3>
            <p className="mb-6 text-center">Are you sure you want to delete <span className="font-semibold">{deleteName}</span>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;