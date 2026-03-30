function AISummaryHealthCards({ insightCards, lowStockCount }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Today's Business Health</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">
            {insightCards[0].value.includes("₹") && parseFloat(insightCards[0].value.replace("₹", "").replace(/,/g, "")) > 10000
              ? "🟢"
              : insightCards[0].value.includes("₹") && parseFloat(insightCards[0].value.replace("₹", "").replace(/,/g, "")) > 5000
              ? "🟡"
              : "🔴"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">Sales</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{insightCards[0].value}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">{lowStockCount > 0 ? "⚠️" : "✅"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">Low Stock</p>
            <p className="text-sm font-semibold text-gray-900">{lowStockCount} items</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">⏰</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">Peak Hour</p>
            <p className="text-sm font-semibold text-gray-900">{insightCards[1].value}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">🔁</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">Repeat Cust</p>
            <p className="text-sm font-semibold text-gray-900">{insightCards[3].value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISummaryHealthCards;
