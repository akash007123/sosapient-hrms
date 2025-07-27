import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Departments from './Departments';
import Employee from './Employee';
import Users from './Users';
import Holidays from './Holidays';
import Reports from './Reports';
import TodoList from './TodoList';
import Gallery from './Gallery';
import Sidenav from './Sidenav';
import Fixnav from './fixnav';
import Events from './Events';
import Clients from './Clients';
import ProjectList from './ProjectList';

const HRMSRoutes: React.FC = () => (
  <Routes>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="departments" element={<Departments />} />
    <Route path="employee" element={<Employee />} />
    <Route path="holidays" element={<Holidays />} />
    <Route path="reports" element={<Reports />} />
    <Route path="todo-list" element={<TodoList />} />
    <Route path="gallery" element={<Gallery />} />
    <Route path="sidenav" element={<Sidenav />} />
    <Route path="fixnav" element={<Fixnav />} />
    <Route path="events" element={<Events />} />
    <Route path="clients" element={<Clients />} />
    <Route path="project-list" element={<ProjectList />} />
  </Routes>
);

export default HRMSRoutes;
