// GA4 type declaration
declare global { interface Window { gtag?: (...args: unknown[]) => void } }

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { PerkPathAuthProvider } from "@/hooks/usePerkPathAuth";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Unsubscribe from "./pages/Unsubscribe";
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
import TAStudioLayout from "./pages/labs/tastudio/TAStudioLayout";
import RowWindowLayout from "./pages/labs/rowwindow/RowWindowLayout";
import AOTULayout from "./pages/labs/aotu/AOTULayout";
import AOTUHome from "./pages/labs/aotu/AOTUHome";
import AOTUStub from "./pages/labs/aotu/AOTUStub";
import BrainFramePlatform from "./pages/labs/aotu/BrainFramePlatform";
import AOTUSolutions from "./pages/labs/aotu/AOTUSolutions";
import AOTUProduct from "./pages/labs/aotu/AOTUProduct";
import VibinLayout from "./pages/labs/vibin/VibinLayout";
import VibinHome from "./pages/labs/vibin/screens/Home";
import VibinCards from "./pages/labs/vibin/screens/Cards";
import VibinCardDetail from "./pages/labs/vibin/screens/CardDetail";
import VibinCardCreate from "./pages/labs/vibin/screens/CardCreate";
import VibinDecks from "./pages/labs/vibin/screens/Decks";
import VibinDeckDetail from "./pages/labs/vibin/screens/DeckDetail";
import VibinDeckCreate from "./pages/labs/vibin/screens/DeckCreate";
import VibinTrips from "./pages/labs/vibin/screens/Trips";
import VibinTripCreate from "./pages/labs/vibin/screens/TripCreate";
import VibinTripDetail from "./pages/labs/vibin/screens/TripDetail";
import VibinProfile from "./pages/labs/vibin/screens/Profile";
import VibinOnboarding from "./pages/labs/vibin/screens/Onboarding";
import VibinShare from "./pages/labs/vibin/screens/ShareView";
import ContractorFinderLayout from "./pages/labs/contractor-finder/ContractorFinderLayout";
import X1SmartLayout from "./pages/labs/x1-smart/X1SmartLayout";
import VerdantLanding from "./pages/labs/verdant/VerdantLanding";
import RoboticsLanding from "./pages/labs/robotics/RoboticsLanding";
import CareKitsLayout from "./pages/labs/carekits/CareKitsLayout";
import CKHome from "./pages/labs/carekits/pages/CKHome";
import CKQuiz from "./pages/labs/carekits/pages/CKQuiz";
import CKResults from "./pages/labs/carekits/pages/CKResults";
import CKMarketplace from "./pages/labs/carekits/pages/CKMarketplace";
import CKProductDetail from "./pages/labs/carekits/pages/CKProductDetail";
import CKSaved from "./pages/labs/carekits/pages/CKSaved";
import CKArticle from "./pages/labs/carekits/pages/CKArticle";
import CKKits from "./pages/labs/carekits/pages/CKKits";
import CKKitDetail from "./pages/labs/carekits/pages/CKKitDetail";
import CKProblem from "./pages/labs/carekits/pages/CKProblem";
import CKAdminLayout from "./pages/labs/carekits/pages/admin/CKAdminLayout";
import CKAdminDashboard from "./pages/labs/carekits/pages/admin/CKAdminDashboard";
import CKAdminProducts from "./pages/labs/carekits/pages/admin/CKAdminProducts";
import CKAdminProductEdit from "./pages/labs/carekits/pages/admin/CKAdminProductEdit";
import CKAdminCategories from "./pages/labs/carekits/pages/admin/CKAdminCategories";
import CKAdminAssessments from "./pages/labs/carekits/pages/admin/CKAdminAssessments";
import CKAdminAnalytics from "./pages/labs/carekits/pages/admin/CKAdminAnalytics";
import CKAdminArticles from "./pages/labs/carekits/pages/admin/CKAdminArticles";
import RaceCompanionLayout from "./pages/labs/race-companion/RaceCompanionLayout";
import RaceToday from "./pages/labs/race-companion/screens/Today";
import RaceSchedule from "./pages/labs/race-companion/screens/Schedule";
import RaceAlerts from "./pages/labs/race-companion/screens/Alerts";
import RaceSettings from "./pages/labs/race-companion/screens/Settings";
import RaceEventDetail from "./pages/labs/race-companion/screens/EventDetail";
import SponsorCRMLayout from "./pages/labs/rhcrm/SponsorCRMLayout";
import ScrmDashboard from "./pages/labs/rhcrm/pages/Dashboard";
import ScrmPipeline from "./pages/labs/rhcrm/pages/Pipeline";
import ScrmSponsors from "./pages/labs/rhcrm/pages/Sponsors";
import ScrmSponsorDetail from "./pages/labs/rhcrm/pages/SponsorDetail";
import ScrmActions from "./pages/labs/rhcrm/pages/Actions";
import ScrmTeam from "./pages/labs/rhcrm/pages/Team";
import BeaverBoatLayout from "./pages/labs/beaver-boat/BeaverBoatLayout";
import BeaverBoatAdmin from "./pages/labs/beaver-boat/BeaverBoatAdmin";
import AsentioOSLayout from "./pages/labs/asentio-os/AsentioOSLayout";
import SmartVisionLayout from "./pages/labs/smart-vision/SmartVisionLayout";
import JustGrapesLayout from "./pages/labs/justgrapes/JustGrapesLayout";
import CFDashboard from "./pages/labs/contractor-finder/Dashboard";
import CFExplore from "./pages/labs/contractor-finder/Explore";
import CFSegments from "./pages/labs/contractor-finder/Segments";
import CFPipeline from "./pages/labs/contractor-finder/Pipeline";
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

const isBeaverBoatHost = () => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'beaverboatclub.org' || h === 'www.beaverboatclub.org';
};

const AppContent = () => {
  const location = useLocation();
  const beaverHost = isBeaverBoatHost();
  const hideNavFooter = beaverHost || location.pathname === '/schedule' || location.pathname === '/labs/wo-buddy' || location.pathname === '/labs/wo-buddy/admin' || location.pathname === '/labs/my-dj' || location.pathname.startsWith('/labs/fieldofviews') || location.pathname.startsWith('/labs/perkpath') || location.pathname.startsWith('/labs/cpconnect') || location.pathname.startsWith('/labs/tastudio') || location.pathname.startsWith('/labs/rowwindow') || location.pathname.startsWith('/labs/aotu') || location.pathname.startsWith('/labs/vibin') || location.pathname.startsWith('/labs/contractor-finder') || location.pathname.startsWith('/labs/x1-smart') || location.pathname.startsWith('/labs/verdant') || location.pathname.startsWith('/labs/carekits') || location.pathname.startsWith('/labs/beaver-boat') || location.pathname.startsWith('/labs/asentio-os') || location.pathname.startsWith('/labs/robotics') || location.pathname.startsWith('/labs/smart-vision') || location.pathname.startsWith('/labs/justgrapes') || location.pathname.startsWith('/labs/rhcrm') || location.pathname.startsWith('/labs/race-companion');

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-YMVGV4MD6C', { page_path: location.pathname + location.search });
    }
  }, [location]);

  if (beaverHost) {
    return (
      <main>
        <Routes>
          <Route path="/admin" element={<BeaverBoatAdmin />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="*" element={<BeaverBoatLayout />} />
        </Routes>
      </main>
    );
  }

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
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
          <Route path="/labs/perkpath" element={<PerkPathAuthProvider><PerkPathLayout /></PerkPathAuthProvider>} />
          <Route path="/labs/cpconnect" element={<CPConnectLayout />} />
          <Route path="/labs/tastudio" element={<TAStudioLayout />} />
          <Route path="/labs/rowwindow" element={<RowWindowLayout />} />
          <Route path="/labs/vibin" element={<VibinLayout />}>
            <Route index element={<VibinHome />} />
            <Route path="cards" element={<VibinCards />} />
            <Route path="cards/new" element={<VibinCardCreate />} />
            <Route path="cards/:id" element={<VibinCardDetail />} />
            <Route path="decks" element={<VibinDecks />} />
            <Route path="decks/new" element={<VibinDeckCreate />} />
            <Route path="decks/:id" element={<VibinDeckDetail />} />
            <Route path="trips" element={<VibinTrips />} />
            <Route path="trips/new" element={<VibinTripCreate />} />
            <Route path="trips/:id" element={<VibinTripDetail />} />
            <Route path="profile" element={<VibinProfile />} />
            <Route path="onboarding" element={<VibinOnboarding />} />
            <Route path="share/:type/:id" element={<VibinShare />} />
          </Route>
          <Route path="/labs/x1-smart" element={<X1SmartLayout />} />
          <Route path="/labs/verdant" element={<VerdantLanding />} />
          <Route path="/labs/robotics" element={<RoboticsLanding />} />
          <Route path="/labs/race-companion" element={<RaceCompanionLayout />}>
            <Route index element={<RaceToday />} />
            <Route path="schedule" element={<RaceSchedule />} />
            <Route path="alerts" element={<RaceAlerts />} />
            <Route path="settings" element={<RaceSettings />} />
            <Route path="event/:id" element={<RaceEventDetail />} />
          </Route>
          <Route path="/labs/carekits" element={<CareKitsLayout />}>
            <Route index element={<CKHome />} />
            <Route path="quiz" element={<CKQuiz />} />
            <Route path="results/:id" element={<CKResults />} />
            <Route path="marketplace" element={<CKMarketplace />} />
            <Route path="product/:id" element={<CKProductDetail />} />
            <Route path="saved" element={<CKSaved />} />
            <Route path="learn/:slug" element={<CKArticle />} />
            <Route path="kits" element={<CKKits />} />
            <Route path="kits/:slug" element={<CKKitDetail />} />
            <Route path="problems/:slug" element={<CKProblem />} />
            <Route path="admin" element={<CKAdminLayout />}>
              <Route index element={<CKAdminDashboard />} />
              <Route path="products" element={<CKAdminProducts />} />
              <Route path="products/new" element={<CKAdminProductEdit />} />
              <Route path="products/:id" element={<CKAdminProductEdit />} />
              <Route path="categories" element={<CKAdminCategories />} />
              <Route path="articles" element={<CKAdminArticles />} />
              <Route path="assessments" element={<CKAdminAssessments />} />
              <Route path="analytics" element={<CKAdminAnalytics />} />
            </Route>
          </Route>
          <Route path="/labs/rhcrm" element={<SponsorCRMLayout />}>
            <Route index element={<ScrmDashboard />} />
            <Route path="pipeline" element={<ScrmPipeline />} />
            <Route path="sponsors" element={<ScrmSponsors />} />
            <Route path="sponsors/:id" element={<ScrmSponsorDetail />} />
            <Route path="actions" element={<ScrmActions />} />
            <Route path="team" element={<ScrmTeam />} />
          </Route>
          <Route path="/labs/beaver-boat" element={<BeaverBoatLayout />} />
          <Route path="/labs/beaver-boat/admin" element={<BeaverBoatAdmin />} />
          <Route path="/labs/asentio-os" element={<AsentioOSLayout />} />
          <Route path="/labs/smart-vision" element={<SmartVisionLayout />} />
          <Route path="/labs/justgrapes" element={<JustGrapesLayout />} />
          <Route path="/labs/contractor-finder" element={<ContractorFinderLayout />}>
            <Route index element={<CFDashboard />} />
            <Route path="explore" element={<CFExplore />} />
            <Route path="segments" element={<CFSegments />} />
            <Route path="pipeline" element={<CFPipeline />} />
          </Route>
          <Route path="/labs/aotu" element={<AOTULayout />}>
            <Route index element={<AOTUHome />} />
            <Route path="product" element={<AOTUProduct />} />
            <Route path="platform" element={<BrainFramePlatform />} />
            <Route path="solutions" element={<AOTUSolutions />} />
            <Route path="marketplace" element={<AOTUStub />} />
            <Route path="developers" element={<AOTUStub />} />
            <Route path="partners" element={<AOTUStub />} />
            <Route path="resources" element={<AOTUStub />} />
            <Route path="company" element={<AOTUStub />} />
          </Route>
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
