import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthPage from "@/pages/AuthPage";
import TodaysSummaryPage from "@/pages/TodaysSummaryPage";
import MainPage from "@/pages/MainPage";
import TraineesPage from "@/pages/TraineesPage";
import BulkViewPage from "@/pages/BulkViewPage";
import ViolationsPage from "@/pages/ViolationsPage";
import DisciplinaryPage from "@/pages/DisciplinaryPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import ClassesPage from "@/pages/ClassesPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<TodaysSummaryPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/trainees" element={<TraineesPage />} />
            <Route path="/bulk-view" element={<BulkViewPage />} />
            <Route path="/violations" element={<ViolationsPage />} />
            <Route path="/disciplinary" element={<DisciplinaryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
