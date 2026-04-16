// GA4 type declaration
declare global { interface Window { gtag?: (...args: unknown[]) => void } }

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Directory from "./pages/Directory";
import ProductDetail from "./pages/ProductDetail";
import CompanyDetail from "./pages/CompanyDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProductForm from "./pages/ProductForm";
import AgencyForm from "./pages/AgencyForm";
import AgencyDetail from "./pages/AgencyDetail";
import UseCaseDetail from "./pages/UseCaseDetail";
import CompanyForm from "./pages/CompanyForm";
import UseCaseForm from "./pages/UseCaseForm";
import Labs from "./pages/Labs";
import ComingSoon from "./pages/ComingSoon";
import WOBuddyLayout from "./pages/labs/wo-buddy/WOBuddyLayout";
import WOBuddyAdminDashboard from "./pages/labs/wo-buddy/WOBuddyAdminDashboard";
import MyDJLayout from "./pages/labs/my-dj/MyDJLayout";
import GovernanceLayout from "./pages/labs/governance/GovernanceLayout";
import GovernanceDashboard from "./pages/labs/governance/GovernanceDashboard";
import PerkPathLayout from "./pages/labs/perkpath/PerkPathLayout";
import CPConnectLayout from "./pages/labs/cpconnect/CPConnectLayout";
import VisionMission from "./pages/labs/governance/VisionMission";
import TranscriptUpload from "./pages/labs/governance/TranscriptUpload";
import PolicyLibrary from "./pages/labs/governance/PolicyLibrary";
import PolicyDiscussion from "./pages/labs/governance/PolicyDiscussion";
import TaskForceMembers from "./pages/labs/governance/TaskForceMembers";

import MeetingMinutes from "./pages/labs/governance/MeetingMinutes";
import FinalizedPolicies from "./pages/labs/governance/FinalizedPolicies";
import Schedule from "./pages/Schedule";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideNavFooter = location.pathname === '/schedule' || location.pathname === '/labs/wo-buddy' || location.pathname === '/labs/wo-buddy/admin' || location.pathname === '/labs/my-dj' || location.pathname.startsWith('/labs/fieldofviews') || location.pathname.startsWith('/labs/perkpath') || location.pathname.startsWith('/labs/cpconnect');

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-YMVGV4MD6C', { page_path: location.pathname + location.search });
    }
  }, [location]);

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/xr-directory" element={<Directory />} />
          <Route path="/xr-directory/company/:companyName" element={<CompanyDetail />} />
          <Route path="/xr-directory/agencies/:slug" element={<AgencyDetail />} />
          <Route path="/xr-directory/use-cases/:slug" element={<UseCaseDetail />} />
          <Route path="/xr-directory/:slug" element={<ProductDetail />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/labs/wo-buddy" element={<WOBuddyLayout />} />
          <Route path="/labs/wo-buddy/admin" element={<WOBuddyAdminDashboard />} />
          <Route path="/labs/my-dj" element={<MyDJLayout />} />
          <Route path="/labs/perkpath" element={<PerkPathLayout />} />
          <Route path="/labs/cpconnect" element={<CPConnectLayout />} />
          <Route path="/labs/fieldofviews" element={<GovernanceLayout />}>
            <Route index element={<GovernanceDashboard />} />
            <Route path="vision" element={<VisionMission />} />
            <Route path="upload" element={<TranscriptUpload />} />
            <Route path="library" element={<PolicyLibrary />} />
            <Route path="library/:id" element={<PolicyDiscussion />} />
            <Route path="members" element={<TaskForceMembers />} />
            <Route path="minutes" element={<MeetingMinutes />} />
            <Route path="finalized" element={<FinalizedPolicies />} />
            
          </Route>
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />
          <Route path="/admin/agencies/new" element={<AgencyForm />} />
          <Route path="/admin/agencies/:id/edit" element={<AgencyForm />} />
          <Route path="/admin/companies/new" element={<CompanyForm />} />
          <Route path="/admin/companies/:id/edit" element={<CompanyForm />} />
          <Route path="/admin/use-cases/new" element={<UseCaseForm />} />
          <Route path="/admin/use-cases/:id/edit" element={<UseCaseForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideNavFooter && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
