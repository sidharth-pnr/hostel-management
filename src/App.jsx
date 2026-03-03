import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Approvals from './pages/admin/Approvals';
import Students from './pages/admin/Students';
import Complaints from './pages/admin/Complaints';
import Rooms from './pages/admin/Rooms';
import Admins from './pages/admin/Admins';

import StudentLayout from './pages/student/StudentLayout';
import StudentOverview from './pages/student/Overview';
import StudentBookRoom from './pages/student/BookRoom';
import StudentComplaints from './pages/student/Complaints';
import StudentProfile from './pages/student/Profile';
import StudentAbout from './pages/student/About';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => { 
    if (user) localStorage.setItem('user', JSON.stringify(user)); 
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const isAdmin = user?.role === 'SUPER' || user?.role === 'STAFF';

  return (
    <Router>
      <Toaster position="top-right" /> 
      <Routes>
        <Route path="/" element={<Landing isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/login" element={<Login setUser={setUser} isDark={isDark} setIsDark={setIsDark} />} />
        <Route path="/register" element={<Register isDark={isDark} setIsDark={setIsDark} />} />
        
        {/* Student Nested Routes */}
        <Route path="/student" element={user?.role === 'student' ? <StudentLayout user={user} setUser={setUser} isDark={isDark} setIsDark={setIsDark}/> : <Navigate to="/login" />}>
          <Route index element={<StudentOverview />} />
          <Route path="book" element={<StudentBookRoom />} />
          <Route path="complaints" element={<StudentComplaints />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="about" element={<StudentAbout />} />
        </Route>
        
        {/* Admin Nested Routes */}
        <Route path="/admin" element={isAdmin ? <AdminLayout user={user} isDark={isDark} setIsDark={setIsDark}/> : <Navigate to="/login" />}>
          <Route index element={<Overview />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="students" element={<Students />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="admins" element={<Admins />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
