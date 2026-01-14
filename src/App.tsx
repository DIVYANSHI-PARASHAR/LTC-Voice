import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { NotificationProvider } from "./contexts/NotificationContext";
import { PatientDataProvider } from "./contexts/PatientDataContext";
import Home from "./pages/Home";

import PatientCaseManager from "./pages/PatientCaseManager";
import AssessorKPI from "./pages/AssessorKPI";
import LevelOfCareAssessment from "./pages/LevelOfCareAssessment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationProvider>
        <PatientDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardLayout><Home /></DashboardLayout>} />

              <Route path="/patient/:patientId" element={<DashboardLayout><PatientCaseManager /></DashboardLayout>} />
              <Route path="/patient/:patientId/level-of-care-assessment" element={<DashboardLayout><LevelOfCareAssessment /></DashboardLayout>} />
              <Route path="/assessor-kpi" element={<DashboardLayout><AssessorKPI /></DashboardLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PatientDataProvider>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
