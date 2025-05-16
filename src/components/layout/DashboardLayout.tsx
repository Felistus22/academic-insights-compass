import React, { ReactNode } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image } from "@/components/ui/image";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
  active: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activePage,
  onNavigate,
}) => {
  const { currentTeacher, logout } = useAppContext();

  if (!currentTeacher) {
    return <div>Unauthorized</div>;
  }

  const navItems: SidebarItem[] = [
    {
      name: "Dashboard",
      icon: (
        <img 
            src="/logo.png" 
            alt="Dashboard Icon" 
            className="w-6 h-6"
        />
      ),
      onClick: () => onNavigate("dashboard"),
      active: activePage === "dashboard",
    },
    {
      name: "Students",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      onClick: () => onNavigate("students"),
      active: activePage === "students",
    },
    {
      name: "Enter Marks",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
      ),
      onClick: () => onNavigate("enterMarks"),
      active: activePage === "enterMarks",
    },
    {
      name: "Reports",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      ),
      onClick: () => onNavigate("reports"),
      active: activePage === "reports",
    },
  ];

  // Add admin-only items
  if (currentTeacher.role === "admin") {
    // Add manage students menu item
    navItems.push({
      name: "Manage Students",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <line x1="17" y1="8" x2="22" y2="8" />
          <line x1="19.5" y1="5.5" x2="19.5" y2="10.5" />
        </svg>
      ),
      onClick: () => onNavigate("manageStudents"),
      active: activePage === "manageStudents",
    });
    
    // Add manage teachers menu item
    navItems.push({
      name: "Manage Teachers",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-4" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      onClick: () => onNavigate("manageTeachers"),
      active: activePage === "manageTeachers",
    });
    
    // Add activity logs menu item
    navItems.push({
      name: "Activity Logs",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      onClick: () => onNavigate("activityLogs"),
      active: activePage === "activityLogs",
    });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-education-primary p-2 rounded-md flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="School Reports Logo" 
                className="w-6 h-6"
              />
            </div>
            <h1 className="text-xl font-bold">Padre Pio ReportCard System</h1>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start ${
                  item.active
                    ? "bg-education-primary hover:bg-education-dark"
                    : ""
                }`}
                onClick={item.onClick}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 w-64 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-2">
              <AvatarFallback className="bg-education-primary text-white">
                {`${currentTeacher.firstName[0]}${currentTeacher.lastName[0]}`}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{`${currentTeacher.firstName} ${currentTeacher.lastName}`}</p>
              <p className="text-xs text-gray-500">
                {currentTeacher.role === "admin" ? "Administrator" : "Teacher"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={logout}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
