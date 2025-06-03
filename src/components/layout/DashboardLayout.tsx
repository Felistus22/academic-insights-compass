
import React, { useState } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import dashboard components
import DashboardHome from "../dashboard/DashboardHome";
import Students from "../dashboard/Students";
import ManageStudents from "../dashboard/ManageStudents";
import ManageTeachers from "../dashboard/ManageTeachers";
import ManageSubjects from "../dashboard/ManageSubjects";
import EnterMarks from "../dashboard/EnterMarks";
import Reports from "../dashboard/Reports";
import ActivityLogs from "../dashboard/ActivityLogs";

type TabKey = 'home' | 'students' | 'manage-students' | 'manage-teachers' | 'manage-subjects' | 'enter-marks' | 'reports' | 'activity-logs';

const DashboardLayout: React.FC = () => {
  const { currentTeacher, logout } = useSupabaseAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentTeacher) {
    return null;
  }

  const menuItems = [
    { key: 'home' as TabKey, label: 'Dashboard', icon: Home, adminOnly: false },
    { key: 'students' as TabKey, label: 'Students', icon: Users, adminOnly: false },
    { key: 'manage-students' as TabKey, label: 'Manage Students', icon: Users, adminOnly: true },
    { key: 'manage-teachers' as TabKey, label: 'Manage Teachers', icon: GraduationCap, adminOnly: true },
    { key: 'manage-subjects' as TabKey, label: 'Manage Subjects', icon: BookOpen, adminOnly: true },
    { key: 'enter-marks' as TabKey, label: 'Enter Marks', icon: ClipboardList, adminOnly: false },
    { key: 'reports' as TabKey, label: 'Reports', icon: FileText, adminOnly: false },
    { key: 'activity-logs' as TabKey, label: 'Activity Logs', icon: Settings, adminOnly: true },
  ].filter(item => !item.adminOnly || currentTeacher.role === 'admin');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome />;
      case 'students':
        return <Students />;
      case 'manage-students':
        return <ManageStudents />;
      case 'manage-teachers':
        return <ManageTeachers />;
      case 'manage-subjects':
        return <ManageSubjects />;
      case 'enter-marks':
        return <EnterMarks />;
      case 'reports':
        return <Reports />;
      case 'activity-logs':
        return <ActivityLogs />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-education-primary" />
            <span className="text-xl font-bold text-gray-900">SchoolMS</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                  activeTab === item.key
                    ? "bg-education-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-education-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {currentTeacher.firstName[0]}{currentTeacher.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {currentTeacher.firstName} {currentTeacher.lastName}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {currentTeacher.role}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block">
            <h1 className="text-2xl font-semibold text-gray-900">
              {menuItems.find(item => item.key === activeTab)?.label}
            </h1>
          </div>
          
          <div className="lg:hidden">
            <span className="text-lg font-semibold text-gray-900">
              {menuItems.find(item => item.key === activeTab)?.label}
            </span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
