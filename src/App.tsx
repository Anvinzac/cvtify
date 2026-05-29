import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import CvBuilder from "./pages/CvBuilder";
import CvPreview from "./pages/CvPreview";
import CategorySelect from "./pages/CategorySelect";
import Dashboard from "./pages/Dashboard";
import AddActivity from "./pages/AddActivity";
import ReportCard from "./pages/ReportCard";
import Recommendations from "./pages/Recommendations";
import DreamJobs from "./pages/DreamJobs";
import Timeline from "./pages/Timeline";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/fx/PageTransition";
import CursorGlow from "./components/fx/CursorGlow";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition routeKey={location.pathname}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<CvBuilder />} />
          <Route path="/cv-preview" element={<CvPreview />} />
          <Route path="/categories" element={<CategorySelect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-activity/:categoryId" element={<AddActivity />} />
          <Route path="/report" element={<ReportCard />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/dream-jobs" element={<DreamJobs />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CursorGlow />
          <AnimatedRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
