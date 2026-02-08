import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentRegister from './pages/StudentRegister';
import Attendance from './pages/Attendance';
import AttendanceList from './pages/AttendanceList';
import StudentDirectory from './pages/StudentDirectory';
import AttendanceReport from './pages/AttendanceReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance-list" element={<AttendanceList />} />
        <Route path="/directory" element={<StudentDirectory />} />
        <Route path="/reports" element={<AttendanceReport />} />
      </Routes>
    </Router>
  );
}

export default App;
