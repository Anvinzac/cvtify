import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import CategorySelect from "./pages/CategorySelect";
import Dashboard from "./pages/Dashboard";
import AddActivity from "./pages/AddActivity";
import ReportCard from "./pages/ReportCard";
import Recommendations from "./pages/Recommendations";
import DreamJobs from "./pages/DreamJobs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<CategorySelect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-activity/:categoryId" element={<AddActivity />} />
            <Route path="/report" element={<ReportCard />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/dream-jobs" element={<DreamJobs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
