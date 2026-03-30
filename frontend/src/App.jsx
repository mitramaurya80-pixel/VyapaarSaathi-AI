import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PremiumPageLoader } from "./components/PremiumLoader";

// ✅ FIX: Landing page should NOT be lazy
import LandingPage from "./pages/LandingPage";

// ✅ Lazy load only secondary pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const AISummaryPage = lazy(() => import("./pages/AISummaryPage"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Fast initial load */}
        <Route path="/" element={<LandingPage />} />

        {/* ✅ Only wrap lazy routes in Suspense */}
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PremiumPageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />

        <Route
          path="/insights"
          element={
            <Suspense fallback={<PremiumPageLoader />}>
              <InsightsPage />
            </Suspense>
          }
        />

        <Route
          path="/recommendations"
          element={
            <Suspense fallback={<PremiumPageLoader />}>
              <RecommendationsPage />
            </Suspense>
          }
        />

        <Route
          path="/ai-summary"
          element={
            <Suspense fallback={<PremiumPageLoader />}>
              <AISummaryPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;