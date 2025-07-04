
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import NavigationItems from "./NavigationItems";
import AdminDashboard from "../dashboard/AdminDashboard";
import TeacherDashboard from "../dashboard/TeacherDashboard";

const DashboardLayout: React.FC = () => {
  const { currentTeacher, logout } = useSupabaseAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentTeacher) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = currentTeacher.role === "admin";

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
          <h1 className="text-xl font-semibold">School Management</h1>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                <NavigationItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white shadow-sm">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold text-gray-900">
                School Management
              </h1>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <div className="px-4">
                <NavigationItems />
              </div>
              <div className="mt-auto px-4 py-4 border-t">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {currentTeacher.firstName} {currentTeacher.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {currentTeacher.role}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsProfileOpen(true)}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Offline Indicator */}
                <OfflineIndicator className="mb-4" />
                
                {isAdmin ? <AdminDashboard /> : <TeacherDashboard />}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {currentTeacher.firstName} {currentTeacher.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {currentTeacher.role}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsProfileOpen(true)}
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
