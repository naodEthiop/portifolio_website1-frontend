import { useState } from "react";
import { Link } from "react-router-dom";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/use-session";
import { ResumeAdmin } from "@/components/resume-admin/ResumeAdmin";

function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const signIn = async () => {
    setBusy(true);
    setMsg("");
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  const sendMagicLink = async () => {
    setBusy(true);
    setMsg("");
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/admin/resume" },
      });
      if (error) throw error;
      setMsg("Magic link sent. Check your email.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to send magic link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-sm font-semibold text-white">Sign in to edit resume</div>
      <div className="mt-2 text-sm text-zinc-400">Use your Supabase Auth user (password or magic link).</div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (optional for magic link)"
          type="password"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
      </div>

      {msg && <div className="mt-3 text-sm text-[var(--terminal-warning)]">{msg}</div>}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={signIn}
          disabled={busy || !email || !password}
          className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 disabled:opacity-50"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={sendMagicLink}
          disabled={busy || !email}
          className="rounded-full border border-white/10 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[color:var(--accent)]/15 disabled:opacity-50"
        >
          Send magic link
        </button>
      </div>
    </div>
  );
}

export function AdminResumePage() {
  const { session, loading } = useSupabaseSession();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--fg)]">
        <div className="ambient-glow" />
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
            <div className="font-semibold text-white">Supabase not configured</div>
            <div className="mt-2 text-zinc-400">
              Set <span className="text-white">VITE_SUPABASE_URL</span> and <span className="text-white">VITE_SUPABASE_ANON_KEY</span> in{" "}
              <span className="text-white">frontend/.env.local</span>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--fg)]">
      <div className="ambient-glow" />

      <header className="sticky top-0 z-10 border-b border-white/5 bg-black/10 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Admin • Resume
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link to="/resume" className="hover:text-white">
              View Resume
            </Link>
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            {session && (
              <button type="button" onClick={signOut} disabled={busy} className="hover:text-white disabled:opacity-50">
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">Checking session…</div>
        )}
        {!loading && !session && <LoginPanel />}
        {!loading && session && (
          <div>
            <div className="mb-8 text-sm text-zinc-400">
              Signed in as <span className="text-white">{session.user.email || session.user.id}</span>
            </div>
            <ResumeAdmin />
          </div>
        )}
      </main>
    </div>
  );
}
