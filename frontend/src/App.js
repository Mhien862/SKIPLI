import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VerifyCode from './pages/VerifyCode';
import SetupAccount from './pages/SetupAccount';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || 'null');
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />} />
        <Route path="/verify" element={<VerifyCode />} />
        <Route path="/setup-account" element={<SetupAccount />} />
        <Route path="/instructor" element={user?.role === 'instructor' ? <InstructorDashboard /> : <Navigate to="/" replace />} />
        <Route path="/student" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
