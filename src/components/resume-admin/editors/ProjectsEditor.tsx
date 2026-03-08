import { useState, type Dispatch, type SetStateAction } from "react";
import { splitCsv, joinCsv } from "@/lib/utils/csv";
import { createProject, deleteProject, updateProject, type ProjectRow } from "@/lib/supabase/resume";

type Props = {
  projects: ProjectRow[];
  setProjects: Dispatch<SetStateAction<ProjectRow[]>>;
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
};

export function ProjectsEditor({ projects, setProjects, busy, setBusy }: Props) {
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    status: "complete",
    tech_csv: "",
    achievements_csv: "",
  });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Projects</h2>
        <p className="mt-2 text-sm text-zinc-400">Use comma-separated values for tech and achievements.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={draft.title}
            onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))}
            placeholder="Title"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <select
            value={draft.status}
            onChange={(e) => setDraft((s) => ({ ...s, status: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
          >
            <option value="complete">complete</option>
            <option value="in_progress">in_progress</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
          placeholder="Description"
          className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={draft.tech_csv}
          onChange={(e) => setDraft((s) => ({ ...s, tech_csv: e.target.value }))}
          placeholder="Tech (comma separated)"
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={draft.achievements_csv}
          onChange={(e) => setDraft((s) => ({ ...s, achievements_csv: e.target.value }))}
          placeholder="Achievements (comma separated)"
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <div className="mt-3">
          <button
            type="button"
            disabled={busy || !(draft.title || "").trim()}
            onClick={async () => {
              setBusy(true);
              try {
                const created = await createProject({
                  title: draft.title.trim(),
                  description: draft.description,
                  status: draft.status,
                  tech: splitCsv(draft.tech_csv),
                  achievements: splitCsv(draft.achievements_csv),
                  sort_order: 0,
                });
                setProjects((list) => [...list, created]);
                setDraft({ title: "", description: "", status: "complete", tech_csv: "", achievements_csv: "" });
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-full border border-white/10 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[color:var(--accent)]/15 disabled:opacity-50"
          >
            Add project
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={p.title}
                onChange={(e) => setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, title: e.target.value } : x)))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
              />
              <select
                value={p.status}
                onChange={(e) => setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, status: e.target.value } : x)))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
              >
                <option value="complete">complete</option>
                <option value="in_progress">in_progress</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <textarea
              value={p.description}
              onChange={(e) => setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, description: e.target.value } : x)))}
              className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
            />
            <input
              value={joinCsv(p.tech)}
              onChange={(e) => setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, tech: splitCsv(e.target.value) } : x)))}
              placeholder="Tech (comma separated)"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
            />
            <input
              value={joinCsv(p.achievements)}
              onChange={(e) =>
                setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, achievements: splitCsv(e.target.value) } : x)))
              }
              placeholder="Achievements (comma separated)"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const saved = await updateProject(p.id, {
                      title: p.title,
                      description: p.description,
                      status: p.status,
                      tech: p.tech,
                      achievements: p.achievements,
                    });
                    setProjects((list) => list.map((x) => (x.id === p.id ? saved : x)));
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await deleteProject(p.id);
                    setProjects((list) => list.filter((x) => x.id !== p.id));
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-300 transition hover:bg-black/30 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="text-sm text-zinc-400">No projects yet.</div>}
      </div>
    </section>
  );
}

