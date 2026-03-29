import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm px-4 md:px-8 py-4 z-50">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent italic tracking-tight drop-shadow-sm">
          VyapaarSathi AI
        </h1>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden text-gray-700 hover:text-blue-600 transition p-2 rounded"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <div className={`hidden md:flex gap-6 text-gray-700 font-medium ${open ? "block absolute left-4 right-4 top-20 bg-white/95 shadow-lg rounded p-4 md:static md:bg-transparent md:shadow-none md:p-0" : ""}`}>
          <Link onClick={() => setOpen(false)} to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link onClick={() => setOpen(false)} to="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
          <Link onClick={() => setOpen(false)} to="/insights" className="hover:text-blue-600 transition">Insights</Link>
          <Link onClick={() => setOpen(false)} to="/recommendations" className="hover:text-blue-600 transition">Recommendations</Link>
          <Link onClick={() => setOpen(false)} to="/ai-summary" className="hover:text-blue-600 transition">Ask AI</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;