
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Settings, 
  Activity,
  DollarSign
} from "lucide-react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";

const NavigationItems: React.FC = () => {
  const location = useLocation();
  const { currentTeacher } = useSupabaseAppContext();
  const isAdmin = currentTeacher?.role === "admin";

  const isActive = (path: string) => {
    return location.pathname === `/dashboard${path}`;
  };

  return (
    <nav className="space-y-2">
      <Link to="/dashboard">
        <Button 
          variant={isActive("") ? "default" : "ghost"} 
          className="w-full justify-start"
        >
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>

      {isAdmin && (
        <Link to="/dashboard/manage-students">
          <Button 
            variant={isActive("/manage-students") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Manage Students
          </Button>
        </Link>
      )}

      <Link to="/dashboard/students">
        <Button 
          variant={isActive("/students") ? "default" : "ghost"} 
          className="w-full justify-start"
        >
          <Users className="mr-2 h-4 w-4" />
          Students
        </Button>
      </Link>

      {isAdmin && (
        <Link to="/dashboard/manage-teachers">
          <Button 
            variant={isActive("/manage-teachers") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Manage Teachers
          </Button>
        </Link>
      )}

      {isAdmin && (
        <Link to="/dashboard/manage-subjects">
          <Button 
            variant={isActive("/manage-subjects") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Subjects
          </Button>
        </Link>
      )}

      <Link to="/dashboard/enter-marks">
        <Button 
          variant={isActive("/enter-marks") ? "default" : "ghost"} 
          className="w-full justify-start"
        >
          <FileText className="mr-2 h-4 w-4" />
          Enter Marks
        </Button>
      </Link>

      <Link to="/dashboard/reports">
        <Button 
          variant={isActive("/reports") ? "default" : "ghost"} 
          className="w-full justify-start"
        >
          <FileText className="mr-2 h-4 w-4" />
          Reports
        </Button>
      </Link>

      {isAdmin && (
        <Link to="/dashboard/fee-management">
          <Button 
            variant={isActive("/fee-management") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Fee Management
          </Button>
        </Link>
      )}

      {isAdmin && (
        <Link to="/dashboard/activity-logs">
          <Button 
            variant={isActive("/activity-logs") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <Activity className="mr-2 h-4 w-4" />
            Activity Logs
          </Button>
        </Link>
      )}
    </nav>
  );
};

export default NavigationItems;
