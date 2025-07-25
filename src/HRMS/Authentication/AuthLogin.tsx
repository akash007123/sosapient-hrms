import React, { useState } from 'react';

const AuthLogin: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'admin') {
      if (email === 'admin@example.com' && password === 'admin123') {
        setError('');
        alert('Admin login successful!');
      } else {
        setError('Invalid admin credentials');
      }
    } else {
      if (email === 'employee@example.com' && password === 'employee123') {
        setError('');
        alert('Employee login successful!');
      } else {
        setError('Invalid employee credentials');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <button
            type="button"
            className={`px-4 py-2 rounded-l ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r ${role === 'employee' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('employee')}
          >
            Employee
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">{role === 'admin' ? 'Admin Login' : 'Employee Login'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <button type="submit" className={`w-full ${role === 'admin' ? 'bg-blue-600' : 'bg-green-600'} text-white py-2 rounded hover:opacity-90`}>
          Login
        </button>
      </form>
    </div>
  );
};

export default AuthLogin; 