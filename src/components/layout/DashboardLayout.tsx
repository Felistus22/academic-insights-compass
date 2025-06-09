import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  UserCheck,
  ClipboardList,
  Activity,
  CreditCard,
  user,
  edit
} from "lucide-react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";

const DashboardLayout: React.FC = () => {
  const { currentTeacher, logout } = useSupabaseAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: UserCheck, label: "Teachers", path: "/dashboard/teachers" },
    { icon: BookOpen, label: "Subjects", path: "/dashboard/subjects" },
    { icon: ClipboardList, label: "Enter Marks", path: "/dashboard/enter-marks" },
    { icon: FileText, label: "Reports", path: "/dashboard/reports" },
    { icon: CreditCard, label: "Fee Management", path: "/dashboard/fees" },
    { icon: Activity, label: "Activity Logs", path: "/dashboard/activity-logs" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-muted border-r border-border flex flex-col`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SM</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="font-semibold text-lg">School Management</span>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={`${isSidebarCollapsed ? 'justify-center px-2' : 'justify-start'} w-full`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className={`h-4 w-4 ${!isSidebarCollapsed && 'mr-2'}`} />
              {!isSidebarCollapsed && item.label}
            </Button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={`${isSidebarCollapsed ? 'justify-center px-2' : 'justify-start'} w-full text-destructive hover:text-destructive`}
            onClick={handleLogout}
          >
            <LogOut className={`h-4 w-4 ${!isSidebarCollapsed && 'mr-2'}`} />
            {!isSidebarCollapsed && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {currentTeacher?.firstName} {currentTeacher?.lastName}
                  </span>
                  <Avatar>
                    <AvatarFallback>
                      {currentTeacher?.firstName?.charAt(0)}{currentTeacher?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                  <edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      <ProfileEditDialog 
        open={isProfileDialogOpen} 
        onOpenChange={setIsProfileDialogOpen} 
      />
    </div>
  );
};

export default DashboardLayout;
