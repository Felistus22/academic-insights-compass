
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAppProvider, useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MigrationPrompt from "./components/MigrationPrompt";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isMigrated, isLoading } = useSupabaseAppContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-education-primary/10 to-education-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-education-primary mx-auto mb-4"></div>
          <p className="text-education-primary font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isMigrated) {
    return <MigrationPrompt />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAppProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </SupabaseAppProvider>
    </QueryClientProvider>
  );
}

export default App;
