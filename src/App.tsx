import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppProvider } from "@/shared/app-state/AppContext";
import CvBuilderRoute from "@/routes/cv-builder";
import CvPreviewRoute from "@/routes/cv-preview";
import CategorySelectRoute from "@/routes/categories";
import DashboardRoute from "@/routes/dashboard";
import AddActivityRoute from "@/routes/add-activity";
import ReportCardRoute from "@/routes/report";
import RecommendationsRoute from "@/routes/recommendations";
import DreamJobsRoute from "@/routes/dream-jobs";
import TimelineRoute from "@/routes/timeline";
import NotFoundRoute from "@/routes/not-found";
import PageTransition from "@/shared/components/fx/PageTransition";
import CursorGlow from "@/shared/components/fx/CursorGlow";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition routeKey={location.pathname}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<CvBuilderRoute />} />
          <Route path="/cv-preview" element={<CvPreviewRoute />} />
          <Route path="/categories" element={<CategorySelectRoute />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/add-activity/:categoryId" element={<AddActivityRoute />} />
          <Route path="/report" element={<ReportCardRoute />} />
          <Route path="/recommendations" element={<RecommendationsRoute />} />
          <Route path="/dream-jobs" element={<DreamJobsRoute />} />
          <Route path="/timeline" element={<TimelineRoute />} />
          <Route path="*" element={<NotFoundRoute />} />
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
