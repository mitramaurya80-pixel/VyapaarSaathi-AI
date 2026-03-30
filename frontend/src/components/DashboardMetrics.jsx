import { memo } from "react";

function DashboardMetrics({ todaySales, weeklySales, transactionCount, peakHour }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-gray-500 text-sm">Today's Sales</h2>
        <p className="text-2xl font-bold mt-2">₹{todaySales}</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-gray-500 text-sm">Weekly Sales</h2>
        <p className="text-2xl font-bold mt-2">₹{weeklySales}</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-gray-500 text-sm">Transactions</h2>
        <p className="text-2xl font-bold mt-2">{transactionCount}</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-gray-500 text-sm">Peak Payment Hour</h2>
        <p className="text-2xl font-bold mt-2">{peakHour}</p>
      </div>
    </section>
  );
}

export default memo(DashboardMetrics);