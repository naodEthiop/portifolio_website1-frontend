import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { fetchResumeData, subscribeToResumeChanges, type ResumeData } from "@/lib/supabase/resume";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function groupByCategory(skills: Array<{ category: string; skill_name: string; proficiency: number }>) {
  const out = new Map<string, Array<{ skill_name: string; proficiency: number }>>();
  for (const s of skills) {
    const list = out.get(s.category) || [];
    list.push({ skill_name: s.skill_name, proficiency: s.proficiency });
    out.set(s.category, list);
  }
  return Array.from(out.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function formatDate(date?: string | null) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export function Resume() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const resumeRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);
      const next = await fetchResumeData();
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resume.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    if (!isSupabaseConfigured()) return;
    const unsubscribe = subscribeToResumeChanges(() => {
      void load();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const personal = data?.personalInfo;
  const skillGroups = useMemo(() => groupByCategory(data?.skills || []), [data?.skills]);
  const projects = data?.projects || [];
  const experience = data?.experience || [];
  const certificates = data?.certificates || [];

  const downloadPdf = async () => {
    const resumeElement = resumeRef.current;
    if (!resumeElement) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(resumeElement, { useCORS: true, backgroundColor: "#ffffff", scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${(personal?.name || "Resume").replace(/\s+/g, "_")}_Resume.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">Loading resume…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
          <div className="font-semibold text-white">Resume unavailable</div>
          <div className="mt-2 text-zinc-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!personal) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
          No resume data yet. Add your personal info in <span className="text-white">/admin/resume</span>.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Resume</div>
          <div className="mt-2 text-sm text-zinc-400">Dynamic data from Supabase • auto-updates enabled</div>
        </div>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={downloading}
          className="rounded-full border border-white/10 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[color:var(--accent)]/15 disabled:opacity-50"
        >
          {downloading ? "Generating PDF…" : "Download Resume"}
        </button>
      </div>

      <div
        ref={resumeRef}
        className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
      >
        <div className="p-10 text-zinc-900">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <h1 className="text-balance text-3xl font-semibold tracking-tight">{personal.name}</h1>
              <div className="mt-2 text-sm text-zinc-600">{personal.title}</div>
              {personal.summary && <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-700">{personal.summary}</p>}
            </div>
            <div className="shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
              <div className="grid gap-1">
                {personal.email && (
                  <a className="hover:underline" href={`mailto:${personal.email}`}>
                    {personal.email}
                  </a>
                )}
                {personal.phone && <div>{personal.phone}</div>}
                {personal.linkedin && (
                  <a className="hover:underline" href={personal.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                )}
                {personal.github && (
                  <a className="hover:underline" href={personal.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                )}
                {personal.portfolio && (
                  <a className="hover:underline" href={personal.portfolio} target="_blank" rel="noreferrer">
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1fr]">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Skills</h2>
              <div className="mt-4 grid gap-4">
                {skillGroups.length === 0 && <div className="text-sm text-zinc-600">Add skills in the admin panel.</div>}
                {skillGroups.map(([category, list]) => (
                  <div key={category} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{category}</div>
                    <div className="mt-3 space-y-2">
                      {list.map((s) => (
                        <div key={`${category}-${s.skill_name}`} className="flex items-center justify-between gap-4">
                          <div className="min-w-0 truncate text-sm text-zinc-800">{s.skill_name}</div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={`${s.skill_name}-${i}`}
                                className={[
                                  "h-2 w-2 rounded-full",
                                  i < s.proficiency ? "bg-[color:var(--accent)]" : "bg-zinc-200",
                                ].join(" ")}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Experience</h2>
              <div className="mt-4 grid gap-4">
                {experience.length === 0 && <div className="text-sm text-zinc-600">Add experience in the admin panel.</div>}
                {experience.map((e) => (
                  <div key={e.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900">{e.role}</div>
                        <div className="mt-1 text-xs text-zinc-600">{e.organization}</div>
                      </div>
                      <div className="shrink-0 text-xs text-zinc-500">{e.period}</div>
                    </div>
                    {e.description && <p className="mt-3 text-sm leading-6 text-zinc-700">{e.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-10 grid gap-10">
            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Projects</h2>
                <div className="text-[11px] text-zinc-500">{projects.length} items</div>
              </div>
              <div className="mt-4 grid gap-4">
                {projects.length === 0 && <div className="text-sm text-zinc-600">Add projects in the admin panel.</div>}
                {projects.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900">{p.title}</div>
                        {p.description && <div className="mt-2 text-sm leading-6 text-zinc-700">{p.description}</div>}
                      </div>
                      <div className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                        {p.status}
                      </div>
                    </div>

                    {(p.tech || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(p.tech || []).map((t) => (
                          <span key={`${p.id}-${t}`} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {(p.achievements || []).length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                        {(p.achievements || []).map((a) => (
                          <li key={`${p.id}-${a}`} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                            <span className="min-w-0">{a}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Certificates</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {certificates.length === 0 && <div className="text-sm text-zinc-600">Add certificates in the admin panel.</div>}
                {certificates.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900">{c.name}</div>
                        <div className="mt-1 text-xs text-zinc-600">{c.issuer}</div>
                      </div>
                      <div className="shrink-0 text-xs text-zinc-500">{formatDate(c.date)}</div>
                    </div>
                    {c.description && <p className="mt-3 text-sm leading-6 text-zinc-700">{c.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-zinc-500">
        Tip: If live updates don’t work, enable Realtime replication for these tables in Supabase (Database → Replication).
      </div>
    </div>
  );
}
