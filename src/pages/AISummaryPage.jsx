import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";

const LANGUAGES = ["English", "Hindi", "Tamil", "Bengali", "Telugu", "Spanish", "French"];

const QUICK_QUESTIONS = [
  "How is my business doing today?",
  "When do I get most customers?",
  "What should I improve?",
  "What should I stock more?",
  "How are repeat customers doing?",
];

const LANGUAGE_CODES = {
  English: "en-US",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Bengali: "bn-IN",
  Telugu: "te-IN",
  Spanish: "es-ES",
  French: "fr-FR",
};

const INSIGHT_CARDS = [
  { title: "Sales Today", value: "₹12,450", icon: "💰", note: "+12% from yesterday" },
  { title: "Peak Hour", value: "6:00 PM", icon: "⏰", note: "Highest customer rush" },
  { title: "Top Category", value: "Snacks", icon: "📦", note: "Best performing today" },
  { title: "Repeat Users", value: "38%", icon: "🔁", note: "Loyal customer share" },
];

function WaveformBars({ active }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.45, 0.75, 1].map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h * 100}%`,
            animationDelay: `${i * 80}ms`,
            animationPlayState: active ? "running" : "paused",
          }}
          className="w-[3px] rounded-full bg-blue-500 origin-bottom waveform-bar"
        />
      ))}
    </div>
  );
}

function AISummaryPage() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("English");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [lastAsked, setLastAsked] = useState("");

  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const speakText = (text, lang) => {
    if (!("speechSynthesis" in window) || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_CODES[lang] || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else if (response) {
      speakText(response, language);
    }
  };

  const handleAsk = async (customQuestion = question) => {
    const prompt = customQuestion.trim();
    if (!prompt) return;

    stopAudio();
    setError("");
    setResponse("");
    setLoading(true);
    setLastAsked(prompt);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, language }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "AI service unavailable.");
      }

      const data = await res.json();
      setResponse(data.answer);

      if (speakEnabled && data.answer) {
        setTimeout(() => speakText(data.answer, language), 300);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Error: ${err.message}`
          : "Unable to reach the AI backend. Start the Python server and try again."
      );
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleAsk();
  };

  return (
    <>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .waveform-bar {
          animation: wave 0.9s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* HERO HEADER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl mb-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-52 h-52 bg-cyan-300/10 rounded-full blur-3xl translate-y-20 -translate-x-10" />

            <div className="relative z-10">
              <p className="uppercase tracking-[0.25em] text-xs text-blue-100 mb-3 font-semibold">
                Smart Merchant Intelligence
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
                VyapaarSathi <span className="text-cyan-200">AI</span>
              </h1>
              <p className="mt-3 text-blue-100 max-w-2xl text-sm sm:text-base leading-relaxed">
                Your multilingual business assistant for store insights, stock suggestions,
                customer trends, and voice-enabled decision support.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm border border-white/20">
                  🌐 Multilingual Support
                </div>
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm border border-white/20">
                  🔊 Voice Enabled
                </div>
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm border border-white/20">
                  📈 Business Insights
                </div>
              </div>
            </div>
          </div>

          {/* INSIGHT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {INSIGHT_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm rounded-2xl p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                    <p className="text-xs text-gray-400 mt-2">{card.note}</p>
                  </div>
                  <div className="text-2xl">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT SIDE */}
            <div className="xl:col-span-2 space-y-6">
              {/* INPUT PANEL */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Ask your AI business assistant</h2>
                    <p className="text-sm text-gray-500">Get quick, practical store advice</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ask about sales, stock, customers..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition bg-gray-50"
                      />
                    </div>

                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="border border-gray-200 rounded-2xl px-4 py-4 text-sm text-gray-700 outline-none focus:border-blue-400 bg-white min-w-[160px]"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAsk()}
                      disabled={loading || !question.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white text-sm font-semibold px-6 py-4 rounded-2xl transition whitespace-nowrap shadow-sm"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                          </svg>
                          Thinking...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          ✨ Ask AI
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSpeakEnabled((v) => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          speakEnabled ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            speakEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-500">
                        🔊 Speak response aloud
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border">
                      Language: <span className="font-medium text-gray-600">{language}</span>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mt-2 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* CHAT AREA */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-6 min-h-[420px]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                    <p className="text-sm text-gray-500">Your assistant replies appear here</p>
                  </div>

                  {response && (
                    <div className="flex items-center gap-3">
                      {isPlaying && <WaveformBars active={isPlaying} />}
                      <button
                        onClick={toggleAudio}
                        className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border transition ${
                          isPlaying
                            ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play voice"}
                      </button>
                    </div>
                  )}
                </div>

                {!response && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 text-gray-400">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-3xl mb-4">
                      💬
                    </div>
                    <p className="text-base font-medium text-gray-500">No conversation yet</p>
                    <p className="text-sm mt-1">Ask a question to get business insights instantly</p>
                  </div>
                )}

                {loading && (
                  <div className="space-y-5">
                    {lastAsked && (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm shadow-sm">
                          {lastAsked}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-bl-md px-4 py-4 shadow-sm">
                        <div className="space-y-2 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-52" />
                          <div className="h-4 bg-gray-200 rounded w-64" />
                          <div className="h-4 bg-gray-200 rounded w-40" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {response && !loading && (
                  <div className="space-y-5">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm shadow-sm">
                        {lastAsked}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[85%] bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            🤖
                          </span>
                          VyapaarSathi AI
                        </div>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {response}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE PANEL */}
            <div className="space-y-6">
              {/* Quick prompts */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Questions</h3>
                <p className="text-sm text-gray-500 mb-4">Tap to ask common merchant questions</p>

                <div className="flex flex-col gap-3">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAsk(q)}
                      disabled={loading}
                      className="text-left text-sm bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-gray-700 px-4 py-3 rounded-2xl transition disabled:opacity-50 border border-gray-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Actions */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Suggested Actions</h3>
                <p className="text-sm text-gray-500 mb-4">Useful merchant-focused next steps</p>

                <div className="space-y-3">
                  {[
                    "📦 Restock top-selling products",
                    "🎯 Run offer for repeat customers",
                    "⏰ Optimize staff during peak hour",
                    "⭐ Improve service based on feedback",
                  ].map((item) => (
                    <div
                      key={item}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice info */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    🔊
                  </div>
                  <div>
                    <h3 className="font-semibold">Voice Assistant</h3>
                    <p className="text-xs text-slate-300">Multilingual playback enabled</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Your AI assistant can speak responses in the selected language,
                  making it easier for local merchants to understand business insights quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AISummaryPage;