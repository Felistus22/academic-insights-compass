
import React, { useState } from "react";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import Login from "@/components/Login";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import Students from "@/components/dashboard/Students";
import EnterMarks from "@/components/dashboard/EnterMarks";
import Reports from "@/components/dashboard/Reports";
import ActivityLogs from "@/components/dashboard/ActivityLogs";
import ManageStudents from "@/components/dashboard/ManageStudents";
import ManageTeachers from "@/components/dashboard/ManageTeachers";
import ManageSubjects from "@/components/dashboard/ManageSubjects";

const DashboardContent = () => {
  const { currentTeacher } = useAppContext();
  const [activePage, setActivePage] = useState("dashboard");

  // For debugging
  console.log("Current teacher:", currentTeacher);
  console.log("Active page:", activePage);

  // Render login if not authenticated
  if (!currentTeacher) {
    console.log("No current teacher, rendering Login component");
    return <Login />;
  }

  // Render the appropriate page based on activePage state
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome />;
      case "students":
        return <Students />;
      case "enterMarks":
        return <EnterMarks />;
      case "reports":
        return <Reports />;
      case "manageStudents":
        return currentTeacher.role === "admin" ? (
          <ManageStudents />
        ) : (
          <DashboardHome />
        );
      case "manageTeachers":
        return currentTeacher.role === "admin" ? (
          <ManageTeachers />
        ) : (
          <DashboardHome />
        );
      case "manageSubjects":
        return currentTeacher.role === "admin" ? (
          <ManageSubjects />
        ) : (
          <DashboardHome />
        );
      case "activityLogs":
        return currentTeacher.role === "admin" ? (
          <ActivityLogs />
        ) : (
          <DashboardHome />
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </DashboardLayout>
  );
};

const Index = () => {
  console.log("Rendering Index component");
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
};

export default Index;
