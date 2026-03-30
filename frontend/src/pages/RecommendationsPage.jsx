import Navbar from "../components/Navbar";
import merchantData from "../data/merchantData";
import { generateRecommendations } from "../utils/insightUtils";

function RecommendationsPage() {
  const recommendations = generateRecommendations(merchantData);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">Growth Recommendations</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition">
              <div className="text-2xl mb-3">💡</div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecommendationsPage;
