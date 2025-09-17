
import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import ManageStudents from "./ManageStudents";
import Students from "./Students";
import ManageTeachers from "./ManageTeachers";
import ManageSubjects from "./ManageSubjects";
import EnterMarks from "./EnterMarks";
import Reports from "./Reports";
import ActivityLogs from "./ActivityLogs";
import FeeManagement from "./FeeManagement";
import { GradingSystem } from "./GradingSystem";
import UserManagement from "./UserManagement";

const AdminDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/manage-students" element={<ManageStudents />} />
      <Route path="/students" element={<Students />} />
      <Route path="/manage-teachers" element={<ManageTeachers />} />
      <Route path="/manage-subjects" element={<ManageSubjects />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/enter-marks" element={<EnterMarks />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/activity-logs" element={<ActivityLogs />} />
      <Route path="/fee-management" element={<FeeManagement />} />
      <Route path="/grading-system" element={<GradingSystem />} />
    </Routes>
  );
};

export default AdminDashboard;
