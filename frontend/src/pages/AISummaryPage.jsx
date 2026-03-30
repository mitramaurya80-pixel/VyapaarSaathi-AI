import { useState, useRef, useEffect, useMemo, Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import merchantData from "../data/merchantData.json";

const AISummaryCharts = lazy(() => import("../components/AISummaryCharts"));
const AISummaryHealthCards = lazy(() => import("../components/AISummaryHealthCards"));

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

// Reverse mapping: speech lang code -> app language name
const SPEECH_LANG_MAP = {
  "en-US": "English",
  "en": "English",
  "hi-IN": "Hindi",
  "hi": "Hindi",
  "ta-IN": "Tamil",
  "ta": "Tamil",
  "bn-IN": "Bengali",
  "bn": "Bengali",
  "te-IN": "Telugu",
  "te": "Telugu",
  "es-ES": "Spanish",
  "es": "Spanish",
  "fr-FR": "French",
  "fr": "French",
};

function AISummaryPage() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("English");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [lastAsked, setLastAsked] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [listeningStatus, setListeningStatus] = useState("");

  const utteranceRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = LANGUAGE_CODES[language] || "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      setListeningStatus("Listening...");
      setError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const current = event.results[i][0]?.transcript || "";
        transcript += current;
        isFinal = event.results[i].isFinal;
      }

      if (transcript) {
        setQuestion(transcript);
        setListeningStatus(isFinal ? "Processing..." : "Listening...");
      }

      if (isFinal) {
        const detectedLang = detectLanguage(transcript, recognition.lang);
        setLanguage(detectedLang);
        setIsRecording(false);
        setListeningStatus("");

        setTimeout(() => {
          handleAsk(transcript, detectedLang);
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      setError(`Mic error: ${event.error}`);
      setIsRecording(false);
      setListeningStatus("");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setListeningStatus("");
    };

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
    };
  }, []);

  const detectLanguage = (transcript, langFromAPI) => {
    // First try API's detected language
    if (langFromAPI) {
      const fullLang = langFromAPI;
      const shortLang = fullLang.split("-")[0];

      if (SPEECH_LANG_MAP[fullLang]) return SPEECH_LANG_MAP[fullLang];
      if (SPEECH_LANG_MAP[shortLang]) return SPEECH_LANG_MAP[shortLang];
    }

    // Fallback: simple keyword detection
    const text = transcript.toLowerCase();
    if (/नमस्ते|आप|क्या|कैसे/.test(text)) return "Hindi";
    if (/வணக்கம்|உங்கள்|என்ன/.test(text)) return "Tamil";
    if (/স্বাগত|আপনি|কি/.test(text)) return "Bengali";
    if (/హలో|మీ|ఏ/.test(text)) return "Telugu";
    if (/hola|cómo|está/.test(text)) return "Spanish";
    if (/bonjour|comment|etes/.test(text)) return "French";

    return "English"; // Default
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      setError("Speech Recognition not supported in this browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      return;
    }

    setError("");
    recognitionRef.current.lang = LANGUAGE_CODES[language] || "en-US";

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setError("Failed to start microphone. Please check permissions.");
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const analytics = useMemo(() => {
    const txns = merchantData.transactions || [];
    const dailySales = merchantData.dailySales || [];
    const inventory = merchantData.inventory || [];
    const merchantInfo = merchantData.merchantInfo || {};

    const totalSales = txns.reduce((sum, t) => sum + t.amount, 0);

    const repeatCustomers = txns.filter((t) => t.customerType === "repeat").length;
    const repeatPct = txns.length ? Math.round((repeatCustomers / txns.length) * 100) : 0;

    const hourCounts = {};
    txns.forEach((t) => {
      const hour = t.time?.split(":")[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHourKey = Object.keys(hourCounts).reduce(
      (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
      Object.keys(hourCounts)[0] || "18"
    );
    const peakHour = `${peakHourKey}:00`;

    const categoryRevenue = {};
    txns.forEach((t) => {
      const cat = t.category || "Other";
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + t.amount;
    });

    const topCategory =
      Object.keys(categoryRevenue).reduce(
        (a, b) => (categoryRevenue[a] > categoryRevenue[b] ? a : b),
        Object.keys(categoryRevenue)[0] || "General"
      );

    const lowStockCount = inventory.filter((item) => item.stock < item.reorderLevel).length;

    const categoryChartData = Object.entries(categoryRevenue).map(([name, revenue]) => ({
      name,
      revenue,
    }));

    const insightCards = [
      {
        title: "Sales Today",
        value: `₹${totalSales.toLocaleString("en-IN")}`,
        icon: "💰",
        note: merchantInfo.name || "Store Revenue",
      },
      {
        title: "Peak Hour",
        value: peakHour,
        icon: "⏰",
        note: "Highest customer rush",
      },
      {
        title: "Top Category",
        value: topCategory,
        icon: "📦",
        note: "Best revenue category",
      },
      {
        title: "Repeat Users",
        value: `${repeatPct}%`,
        icon: "🔁",
        note: `${repeatCustomers} loyal customers`,
      },
    ];

    return {
      insightCards,
      dailySales,
      categoryChartData,
      lowStockCount,
      merchantInfo,
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

  const handleAsk = async (customQuestion = question, customLanguage = language) => {
    const prompt = customQuestion.trim();
    if (!prompt) return;

    stopAudio();
    setError("");
    setResponse("");
    setLoading(true);
    setLastAsked(prompt);
    
    const langToUse = customLanguage || language;

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, language: langToUse }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "AI service unavailable.");
      }

      const data = await res.json();
      setResponse(data.answer);

      if (speakEnabled && data.answer) {
        setTimeout(() => speakText(data.answer, langToUse), 300);
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

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          
          {/* TODAY'S BUSINESS HEALTH STRIP (lazy loaded) */}
          <Suspense fallback={<div className="text-center text-sm text-gray-500 py-8">Loading overview...</div>}>
            <AISummaryHealthCards insightCards={analytics.insightCards} lowStockCount={analytics.lowStockCount} />
          </Suspense>

          {/* CHARTS SECTION (lazy loaded) */}
          <Suspense fallback={<div className="text-center text-sm text-gray-500 py-8">Loading charts...</div>}>
            <AISummaryCharts dailySales={analytics.dailySales} categoryChartData={analytics.categoryChartData} />
          </Suspense>

          {/* MAIN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT COLUMN - AI ASSISTANT */}
            <div className="lg:col-span-2 space-y-4">
              {/* ASK BUSINESS ASSISTANT */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Ask About Your Business</h2>

                <div className="space-y-3">
                  {/* Input Row */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
                    />

                    <button
                      onClick={toggleMic}
                      disabled={loading}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <span className="animate-pulse">🎤</span> Stop
                        </>
                      ) : (
                        <>🎙️ Voice</>
                      )}
                    </button>

                    <button
                      onClick={() => handleAsk()}
                      disabled={loading || !question.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition whitespace-nowrap"
                    >
                      {loading ? "Asking..." : "Ask"}
                    </button>
                  </div>

                  {/* Listening Status */}
                  {listeningStatus && (
                    <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="animate-pulse">●</span>
                      {listeningStatus}
                    </div>
                  )}

                  {/* Language & Voice Settings */}
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-blue-400 bg-white"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setSpeakEnabled((v) => !v)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        speakEnabled
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 border border-gray-300"
                      }`}
                    >
                      🔊 {speakEnabled ? "On" : "Off"}
                    </button>

                    <span className="text-xs text-gray-500 py-2">AI responds in {language}</span>
                  </div>

                  {error && (
                    <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* QUICK ACTION BUTTONS */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Common Business Questions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAsk("Why are my sales low today?")}
                    disabled={loading}
                    className="text-left text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 px-3 py-2.5 rounded-lg transition disabled:opacity-50 border border-gray-200 font-medium"
                  >
                    📉 Why are sales low?
                  </button>
                  <button
                    onClick={() => handleAsk("What items should I restock?")}
                    disabled={loading}
                    className="text-left text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 px-3 py-2.5 rounded-lg transition disabled:opacity-50 border border-gray-200 font-medium"
                  >
                    📦 What to restock?
                  </button>
                  <button
                    onClick={() => handleAsk("When is my peak business time?")}
                    disabled={loading}
                    className="text-left text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 px-3 py-2.5 rounded-lg transition disabled:opacity-50 border border-gray-200 font-medium"
                  >
                    ⏰ Peak time?
                  </button>
                  <button
                    onClick={() => handleAsk("How many repeat customers do I have?")}
                    disabled={loading}
                    className="text-left text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 px-3 py-2.5 rounded-lg transition disabled:opacity-50 border border-gray-200 font-medium"
                  >
                    🔁 Repeat customers?
                  </button>
                </div>
              </div>

              {/* RESPONSE AREA */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-h-[280px]">
                {!response && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="text-3xl mb-2">💬</div>
                    <p className="text-sm font-medium text-gray-600">No response yet</p>
                    <p className="text-xs text-gray-500 mt-1">Ask a question to get insights</p>
                  </div>
                )}

                {loading && (
                  <div className="space-y-3">
                    {lastAsked && (
                      <div className="flex justify-end">
                        <div className="max-w-xs bg-blue-600 text-white rounded-lg px-3 py-2 text-sm">
                          {lastAsked}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-3">
                        <div className="space-y-2 animate-pulse">
                          <div className="h-3 bg-gray-300 rounded w-48" />
                          <div className="h-3 bg-gray-300 rounded w-56" />
                          <div className="h-3 bg-gray-300 rounded w-40" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {response && !loading && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-xs bg-blue-600 text-white rounded-lg px-4 py-2 text-sm">
                        {lastAsked}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-lg">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {response}
                        </p>
                      </div>
                    </div>

                    {response && (
                      <div className="flex justify-start pt-2">
                        <button
                          onClick={toggleAudio}
                          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                            isPlaying
                              ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                              : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <WaveformBars active={true} /> Pause
                            </>
                          ) : (
                            <>▶️ Play voice</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - STORE STATUS */}
            <div className="space-y-4">
              {/* STORE STATUS */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Store Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">🏪</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Store Name</p>
                      <p className="font-semibold text-gray-900 text-sm">{analytics.merchantInfo.name || "Your Store"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">📍</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900 text-sm">{analytics.merchantInfo.location || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">📦</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Top Category</p>
                      <p className="font-semibold text-gray-900 text-sm">{analytics.insightCards[2].value}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ALERTS & ACTIONS */}
              {analytics.lowStockCount > 0 && (
                <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Action Needed</h4>
                  <p className="text-xs text-yellow-800 mb-3">
                    {analytics.lowStockCount} item{analytics.lowStockCount !== 1 ? "s" : ""} running low on stock.
                  </p>
                  <button
                    onClick={() => handleAsk(`I have ${analytics.lowStockCount} items with low stock. What should I do?`)}
                    disabled={loading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2 rounded-lg font-medium transition"
                  >
                    Get Advice
                  </button>
                </div>
              )}

              {/* ABOUT AI */}
              <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 About AI Assistant</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Your personal business advisor. Ask about sales, inventory, customers, and trends. Works in {LANGUAGES.length} languages.
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