import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";

const LANGUAGES = ["English", "Hindi", "Tamil", "Bengali", "Spanish", "French"];

const QUICK_QUESTIONS = [
  "How is my business doing today?",
  "When do I get most customers?",
  "What should I improve?",
  "What should I stock more?",
  "How are repeat customers doing?",
];

// Waveform bars — animate while audio plays
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
  const [question, setQuestion]       = useState("");
  const [language, setLanguage]       = useState("English");
  const [response, setResponse]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [isPlaying, setIsPlaying]     = useState(false);
  const [audioReady, setAudioReady]   = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);

  const audioRef = useRef(null);

  // Cleanup audio on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const toggleAudio = () => (isPlaying ? stopAudio() : playAudio());

  const handleAsk = async (customQuestion = question) => {
    const prompt = customQuestion.trim();
    if (!prompt) return;

    stopAudio();
    setError("");
    setResponse("");
    setAudioReady(false);
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, language, speak: speakEnabled }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "AI service unavailable.");
      }

      const data = await res.json();
      setResponse(data.answer);

      // Mount audio if backend returned TTS
      if (data.audio_base64) {
        const src = `data:audio/mp3;base64,${data.audio_base64}`;
        const audio = new Audio(src);
        audio.onended = () => setIsPlaying(false);
        audioRef.current = audio;
        setAudioReady(true);
        // Auto-play
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Error: ${err.message}`
          : "Unable to reach the AI backend. Start the Python server and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleAsk();
  };

  return (
    <>
      {/* Keyframe for waveform animation */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1);   }
        }
        .waveform-bar {
          animation: wave 0.9s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="p-6 max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              VyapaarSathi <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Ask questions about your store — in any language
            </p>
          </div>

          {/* Input card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-5">

            {/* Question input row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Ask about your business…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />

              {/* Language picker */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 bg-white"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>

              {/* Ask button */}
              <button
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 rounded-xl transition whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                    Thinking…
                  </span>
                ) : "Ask AI"}
              </button>
            </div>

            {/* Speak toggle */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSpeakEnabled((v) => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  speakEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    speakEnabled ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-xs text-gray-500 select-none">
                Speak response aloud
              </span>
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Quick-question chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition disabled:opacity-50 border border-blue-100"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Response card */}
          {(response || loading) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">

              {/* Response header + audio controls */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  AI Response
                </h2>

                {audioReady && (
                  <div className="flex items-center gap-3">
                    {isPlaying && <WaveformBars active={isPlaying} />}
                    <button
                      onClick={toggleAudio}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                        isPlaying
                          ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          {/* Pause icon */}
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                          Pause
                        </>
                      ) : (
                        <>
                          {/* Play icon */}
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Play again
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Loading skeleton */}
              {loading && !response && (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                  <div className="h-4 bg-gray-100 rounded w-4/6" />
                </div>
              )}

              {response && (
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                  {response}
                </p>
              )}
            </div>
          )}

          {/* Empty state */}
          {!response && !loading && (
            <div className="text-center py-16 text-gray-400">
              <svg className="mx-auto mb-3 w-10 h-10 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <p className="text-sm">Ask a question or pick one above to get started</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default AISummaryPage;