import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Route Guards
import { AdminRoute, StudentRoute, PublicRoute } from './components/AuthWrappers';

// Pages - Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - Admin
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Approvals from './pages/admin/Approvals';
import Students from './pages/admin/Students';
import Complaints from './pages/admin/Complaints';
import Rooms from './pages/admin/Rooms';
import Admins from './pages/admin/Admins';

// Pages - Student
import StudentLayout from './pages/student/StudentLayout';
import StudentOverview from './pages/student/Overview';
import StudentBookRoom from './pages/student/BookRoom';
import StudentComplaints from './pages/student/Complaints';
import StudentProfile from './pages/student/Profile';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes - Not accessible if logged in */}
        <Route element={<PublicRoute user={user} />}>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student Routes - Restricted to 'student' role */}
        <Route element={<StudentRoute user={user} />}>
          <Route path="/student" element={<StudentLayout user={user} setUser={setUser} />}>
            <Route index element={<StudentOverview />} />
            <Route path="book" element={<StudentBookRoom />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* Admin Routes - Restricted to 'SUPER' or 'STAFF' roles */}
        <Route element={<AdminRoute user={user} />}>
          <Route path="/admin" element={<AdminLayout user={user} setUser={setUser} />}>
            <Route index element={<Overview />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="students" element={<Students />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="admins" element={<Admins />} />
          </Route>
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

