import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/hrms/dashboard', icon: '📊' },
  { label: 'Users', path: '/hrms/users', icon: '👤' },
  { label: 'Department', path: '/hrms/departments', icon: '🏢' },
  { label: 'Employee', path: '/hrms/employee', icon: '🧑‍💼' },
  { label: 'Statistics', path: '/hrms/statistics', icon: '📈' },
  { label: 'Activities', path: '/hrms/activities', icon: '📝' },
  { label: 'Holidays', path: '/hrms/holidays', icon: '🎉' },
  { label: 'Events', path: '/hrms/events', icon: '📅' },
  { label: 'Reports', path: '/hrms/reports', icon: '📑' },
  { label: 'Gallery', path: '/hrms/gallery', icon: '🖼️' },
  { label: 'Todo List', path: '/hrms/todo-list', icon: '✅' },
];

const Sidenav: React.FC = () => {
  const [open, setOpen] = useState(true);

  return (
    <nav className={`bg-white border-r h-full fixed top-0 left-0 z-40 transition-all duration-300 ${open ? 'w-64' : 'w-16'} md:relative md:w-64`}>
      <div className="flex items-center justify-between p-4 border-b">
        <span className={`font-bold text-lg transition-all duration-300 ${open ? 'block' : 'hidden'} md:block`}>HRMS</span>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <span className="text-2xl">{open ? '✖️' : '☰'}</span>
        </button>
      </div>
      <ul className="mt-4 space-y-1">
        {navItems.map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 text-gray-700 ${isActive ? 'bg-gray-200 font-semibold' : ''}`
              }
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className={`transition-all duration-300 ${open ? 'block' : 'hidden'} md:block`}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidenav;