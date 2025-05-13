
import React, { useState } from "react";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import Login from "@/components/Login";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import Students from "@/components/dashboard/Students";
import EnterMarks from "@/components/dashboard/EnterMarks";
import Reports from "@/components/dashboard/Reports";
import ActivityLogs from "@/components/dashboard/ActivityLogs";

const DashboardContent = () => {
  const { currentTeacher } = useAppContext();
  const [activePage, setActivePage] = useState("dashboard");

  // Redirect to login if not authenticated
  if (!currentTeacher) {
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
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
};

export default Index;
