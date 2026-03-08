import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/api/admin";
import { persistAdminToken } from "@/lib/auth/token";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      persistAdminToken(res.token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
      <form onSubmit={onSubmit} className="panel w-full rounded-xl p-7">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-terminal-muted">Admin Access</p>
        <h1 className="mt-2 text-2xl font-bold">Portfolio Control Plane</h1>
        <p className="mt-2 text-sm text-terminal-muted">Use your admin credentials to manage portfolio content.</p>

        <label className="mt-6 block text-xs uppercase tracking-[0.16em] text-terminal-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm outline-none focus:border-terminal-accent"
        />

        <label className="mt-4 block text-xs uppercase tracking-[0.16em] text-terminal-muted">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm outline-none focus:border-terminal-accent"
        />

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded border border-terminal-accent bg-terminal-accent/10 px-4 py-2 font-mono text-sm text-terminal-accent transition hover:bg-terminal-accent/20 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
