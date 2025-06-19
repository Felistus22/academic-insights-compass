
import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import Students from "./Students";
import EnterMarks from "./EnterMarks";
import Reports from "./Reports";

const TeacherDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/students" element={<Students />} />
      <Route path="/enter-marks" element={<EnterMarks />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
};

export default TeacherDashboard;
