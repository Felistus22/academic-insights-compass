
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import Login from "@/components/Login";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Index = () => {
  const { currentTeacher } = useSupabaseAppContext();

  if (!currentTeacher) {
    return <Login />;
  }

  return <DashboardLayout />;
};

export default Index;
