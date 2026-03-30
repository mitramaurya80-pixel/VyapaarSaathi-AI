export function PremiumPageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-6">
      <div className="relative w-full max-w-md">
        {/* Soft glow background */}
        <div className="absolute inset-0 bg-blue-200/20 blur-3xl rounded-full scale-125"></div>

        {/* Main card */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-10 text-center overflow-hidden">
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>

          {/* Logo / brand circle */}
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg flex items-center justify-center animate-float">
            <span className="text-white text-2xl font-bold">V</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            VyapaarSathi AI
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Preparing your intelligent business workspace...
          </p>

          {/* Elegant loading dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-dot1"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-dot2"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-dot3"></span>
          </div>

          {/* Bottom subtle status */}
          <div className="mt-8">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-loaderbar"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PremiumSectionLoader() {
  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-lg p-8 overflow-hidden">
      {/* shimmer top line */}
      <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-5 w-40 rounded-md bg-slate-200 animate-pulse mb-3"></div>
          <div className="h-4 w-28 rounded-md bg-slate-100 animate-pulse"></div>
        </div>

        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-dot1"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-dot2"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-dot3"></span>
        </div>
      </div>

      {/* chart skeleton */}
      <div className="space-y-4">
        <div className="h-56 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse"></div>

        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
          <div className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
          <div className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function PremiumInlineLoader() {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
      <span className="h-2 w-2 rounded-full bg-blue-600 animate-dot1"></span>
      <span className="h-2 w-2 rounded-full bg-blue-500 animate-dot2"></span>
      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-dot3"></span>
      <span>Loading...</span>
    </div>
  );
}