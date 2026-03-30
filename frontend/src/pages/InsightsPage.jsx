import Navbar from "../components/Navbar";
import merchantData from "../data/merchantData";
import { generateInsights } from "../utils/insightUtils";

function InsightsPage() {
  const insights = generateInsights(merchantData);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">AI Business Insights</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
              <div className="text-3xl mb-3">{insight.icon}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{insight.title}</h2>
              <p className="text-gray-600">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InsightsPage;
