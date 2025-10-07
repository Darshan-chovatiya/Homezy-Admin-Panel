import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserManagement from "./pages/Admin/UserManagement";
import ServiceManagement from "./pages/Admin/ServiceManagement";
import BookingOversight from "./pages/Admin/BookingOversight";
import AnalyticsDashboard from "./pages/Admin/AnalyticsDashboard";
import SupportModeration from "./pages/Admin/SupportModeration";
import PromotionsMarketing from "./pages/Admin/PromotionsMarketing";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/services" element={<ServiceManagement />} />
            <Route path="/admin/bookings" element={<BookingOversight />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/support" element={<SupportModeration />} />
            <Route path="/admin/promotions" element={<PromotionsMarketing />} />
            <Route path="/profile" element={<UserProfiles />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
