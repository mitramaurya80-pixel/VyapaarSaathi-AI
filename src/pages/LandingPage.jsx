import { memo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side Content */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Welcome to VyapaarSathi AI
            </h1>

            <p className="text-xl text-blue-600 font-semibold">
              AI-Powered Business Intelligence for Merchants
            </p>

            <p className="text-lg text-gray-600 leading-relaxed">
              Transform your business with intelligent insights, automated recommendations,
              and real-time analytics. Make data-driven decisions that drive growth and profitability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
              >
                View Dashboard
              </Link>

              <Link
                to="/ai-summary"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition text-center"
              >
                Ask AI Assistant
              </Link>
            </div>
          </div>

          {/* Right Side Feature Cards */}
          <div className="space-y-6">
            <article className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-3xl mb-3" aria-hidden="true">📊</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Smart Merchant Dashboard</h2>
              <p className="text-gray-600">
                Real-time sales tracking, transaction analytics, and performance metrics at your fingertips.
              </p>
            </article>

            <article className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="text-3xl mb-3" aria-hidden="true">🤖</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">AI-Powered Insights</h2>
              <p className="text-gray-600">
                Discover hidden patterns, customer behavior trends, and actionable business intelligence.
              </p>
            </article>

            <article className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-3xl mb-3" aria-hidden="true">🚀</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Growth Recommendations</h2>
              <p className="text-gray-600">
                Personalized strategies to boost sales, improve customer retention, and scale your business.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default memo(LandingPage);