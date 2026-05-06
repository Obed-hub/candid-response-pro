import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Businesses from "./pages/Businesses";
import NewBusiness from "./pages/NewBusiness";
import Inbox from "./pages/Inbox";
import FeedbackDetail from "./pages/FeedbackDetail";
import QrPage from "./pages/QrPage";
import WidgetPage from "./pages/WidgetPage";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import AboutUs from "./pages/AboutUs";
import PublicFeedback from "./pages/PublicFeedback";
import PublicReputation from "./pages/PublicReputation";
import CommunityPage from "./pages/CommunityPage";
import SmartTriggers from "./pages/SmartTriggers";
import { DynamicSEOPage } from "./pages/DynamicSEOPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/roadmap" element={<CommunityPage />} />
            <Route path="/privacy" element={<Landing />} />
            <Route path="/terms" element={<Landing />} />
            <Route path="/feedback/:slug" element={<PublicFeedback />} />
            <Route path="/reputation/:slug" element={<PublicReputation />} />
            <Route path="/community/:slug" element={<CommunityPage />} />

            {/* SEO Programmatic Pages */}
            <Route path="/industries/:slug" element={<DynamicSEOPage />} />
            <Route path="/use-cases/:slug" element={<DynamicSEOPage />} />
            <Route path="/locations/:slug" element={<DynamicSEOPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/businesses" element={<ProtectedRoute><Businesses /></ProtectedRoute>} />
            <Route path="/businesses/new" element={<ProtectedRoute><NewBusiness /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/feedback-detail/:id" element={<ProtectedRoute><FeedbackDetail /></ProtectedRoute>} />
            <Route path="/qr" element={<ProtectedRoute><QrPage /></ProtectedRoute>} />
            <Route path="/widget" element={<ProtectedRoute><WidgetPage /></ProtectedRoute>} />
            <Route path="/triggers" element={<ProtectedRoute><SmartTriggers /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
