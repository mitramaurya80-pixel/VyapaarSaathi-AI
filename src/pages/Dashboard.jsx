import { lazy, Suspense, useEffect, useState } from "react";
import { PremiumSectionLoader } from "../components/PremiumLoader";
import merchantData from "../data/merchantData";
import {
  getTodaySales,
  getWeeklySales,
  getTransactionCount,
  getPeakHour,
} from "../utils/dashboardUtils";
import { getWeeklyAverage, generateAISummary } from "../utils/insightUtils";
import Navbar from "../components/Navbar";

// ✅ Keep above-the-fold content eager
import DashboardMetrics from "../components/DashboardMetrics";
import AISummaryPanel from "../components/AISummaryPanel";

// ✅ Lazy load only heavy below-the-fold content
const WeeklySalesChart = lazy(() => import("../components/WeeklySalesChart"));
const ReportsTable = lazy(() => import("../components/ReportsTable"));



function Dashboard() {
  const [showHeavySections, setShowHeavySections] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHeavySections(true);
    }, 250); // small delay so first paint stays fast

    return () => clearTimeout(timer);
  }, []);

  const todaySales = getTodaySales(merchantData.transactions);
  const weeklySales = getWeeklySales(merchantData.dailySales);
  const transactionCount = getTransactionCount(merchantData.transactions);
  const peakHour = getPeakHour(merchantData.transactions);
  const weeklyAverage = getWeeklyAverage(merchantData.dailySales);
  const aiSummary = generateAISummary(todaySales, weeklyAverage, peakHour);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>

        {/* ✅ Instant visible content */}
        <DashboardMetrics
          todaySales={todaySales}
          weeklySales={weeklySales}
          transactionCount={transactionCount}
          peakHour={peakHour}
        />

        <AISummaryPanel aiSummary={aiSummary} />

        {/* ✅ Heavy content delayed */}
        {showHeavySections && (
          <Suspense fallback={<PremiumSectionLoader />}>
            <div className="space-y-8">
              <WeeklySalesChart data={merchantData.dailySales} />
              <ReportsTable data={merchantData.transactions} />
            </div>
          </Suspense>
        )}
      </main>
    </div>
  );
}

export default Dashboard;