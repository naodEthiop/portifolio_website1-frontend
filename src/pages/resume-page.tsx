import { Link } from "react-router-dom";
import { Resume } from "@/components/resume/Resume";

export function ResumePage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--fg)]">
      <div className="ambient-glow" />

      <header className="sticky top-0 z-10 border-b border-white/5 bg-black/10 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Portfolio
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/admin/resume" className="hover:text-white">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <Resume />
    </div>
  );
}

