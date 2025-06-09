import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SupabaseAppContextProvider } from "./contexts/SupabaseAppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./components/dashboard/DashboardHome";
import Students from "./components/dashboard/Students";
import ManageTeachers from "./components/dashboard/ManageTeachers";
import ManageSubjects from "./components/dashboard/ManageSubjects";
import EnterMarks from "./components/dashboard/EnterMarks";
import Reports from "./components/dashboard/Reports";
import FeeManagement from "./components/dashboard/FeeManagement";
import ActivityLogs from "./components/dashboard/ActivityLogs";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <SupabaseAppContextProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="students" element={<Students />} />
                  <Route path="teachers" element={<ManageTeachers />} />
                  <Route path="subjects" element={<ManageSubjects />} />
                  <Route path="enter-marks" element={<EnterMarks />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="fees" element={<FeeManagement />} />
                  <Route path="activity-logs" element={<ActivityLogs />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </SupabaseAppContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
