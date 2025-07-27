import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidenav: React.FC = () => {
  const [open, setOpen] = useState(false); // for mobile
  const [collapsed, setCollapsed] = useState(false); // collapse/expand sidebar
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const { user } = useAuth();

  const directoryItems = [
    { label: 'Dashboard', path: '/hrms/dashboard' },
    ...(user?.role === 'admin'
      ? [
          { label: 'Users', path: '/hrms/users' },
          { label: 'Department', path: '/hrms/departments' },
          { label: 'Employee', path: '/hrms/employee' },
          { label: 'Statistics', path: '/hrms/statistics' },
          { label: 'Leaves', path: '/hrms/leaves' },
          { label: 'Links', path: '/hrms/links' },
        ]
      : []),
    { label: 'Activities', path: '/hrms/activities' },
    { label: 'Holidays', path: '/hrms/holidays' },
    { label: 'Events', path: '/hrms/events' },
    { label: 'Reports', path: '/hrms/reports' },
    { label: 'Gallery', path: '/hrms/gallery' },
    { label: 'Todo List', path: '/hrms/todo-list' },
  ];

  const projectItems = [
    ...(user?.role === 'admin'
      ? [
          { label: 'Project List', path: '/hrms/project-list' },
          { label: 'Clients', path: '/hrms/clients' },
        ]
      : []),
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <nav
        className={`bg-white border-r border-gray-200 fixed z-40 top-0 left-0 h-screen transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-72'} md:translate-x-0 md:relative shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-700 to-purple-600">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
                <span className="text-purple-700 font-bold text-xl">H</span>
              </div>
              <span className="font-bold text-white text-lg">Sosapient HR</span>
            </div>
          ) : (
            <div className="text-white text-xl font-bold">H</div>
          )}
          <div className="flex items-center gap-2">
            {/* Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white bg-white/10 hover:bg-white/20 p-1 rounded transition text-sm"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '»' : '«'}
            </button>
            {/* Mobile Close */}
            <button className="md:hidden text-white" onClick={() => setOpen(false)}>
              ✖️
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2">
          <h3
            className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ${
              collapsed ? 'text-center' : 'px-3'
            }`}
          >
            {collapsed ? '' : 'Menu'}
          </h3>

          {/* Directory Items */}
          <div className="space-y-1">
            {directoryItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? 'justify-center' : ''
                  } px-3 py-2 rounded-lg transition-all duration-200 text-sm hover:bg-purple-50 group ${
                    isActive ? 'bg-purple-100 font-semibold text-purple-700' : 'text-gray-700'
                  }`
                }
                onClick={() => setOpen(false)}
                title={collapsed ? item.label : ''}
              >
                <span className="mr-3 text-lg transition-transform duration-200 group-hover:text-purple-600">
                  <span className="group-hover:hidden">...</span>
                  <span className="hidden group-hover:inline">→</span>
                </span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>

          {/* Project Dropdown */}
          {projectItems.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsProjectOpen(!isProjectOpen)}
                className={`w-full flex items-center justify-between ${
                  collapsed ? 'justify-center' : ''
                } text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3`}
              >
                {!collapsed && <span>Project</span>}
                {!collapsed && (
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isProjectOpen ? 'rotate-90 text-purple-600' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {isProjectOpen && (
                <ul className="space-y-1">
                  {projectItems.map((item) => (
                    <li key={item.label}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center ${
                            collapsed ? 'justify-center' : ''
                          } px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-purple-50 text-sm group ${
                            isActive ? 'bg-purple-100 font-semibold text-purple-700' : 'text-gray-700'
                          }`
                        }
                        onClick={() => setOpen(false)}
                        title={collapsed ? item.label : ''}
                      >
                        <span className="mr-3 text-lg transition-transform duration-200 group-hover:text-purple-600">
                          <span className="group-hover:hidden">...</span>
                          <span className="hidden group-hover:inline">→</span>
                        </span>
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {/* <div className="p-4 border-t border-gray-200 flex items-center justify-around bg-gray-50">
          <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors" title="Settings">
            ⚙️
          </button>
          <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors" title="Lock">
            🔒
          </button>
          <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors" title="Menu">
            ☰
          </button>
        </div> */}

        {/* Scrollbar Style */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a5b4fc;
          }
        `}</style>
      </nav>

      {/* Hamburger for mobile */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-30 md:hidden bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
      >
        ☰
      </button>
    </>
  );
};

export default Sidenav;
