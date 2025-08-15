
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import Login from "@/components/Login";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InstallPrompt from "@/components/ui/install-prompt";

const Index = () => {
  const { currentTeacher } = useSupabaseAppContext();

  if (!currentTeacher) {
    return (
      <>
        <Login />
        <InstallPrompt />
      </>
    );
  }

  return (
    <>
      <DashboardLayout />
      <InstallPrompt />
    </>
  );
};

export default Index;
