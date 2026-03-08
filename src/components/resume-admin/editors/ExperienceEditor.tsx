import { useState, type Dispatch, type SetStateAction } from "react";
import { createExperience, deleteExperience, updateExperience, type ExperienceRow } from "@/lib/supabase/resume";

type Props = {
  experience: ExperienceRow[];
  setExperience: Dispatch<SetStateAction<ExperienceRow[]>>;
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
};

export function ExperienceEditor({ experience, setExperience, busy, setBusy }: Props) {
  const [draft, setDraft] = useState({ role: "", organization: "", period: "", description: "" });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Experience</h2>
        <p className="mt-2 text-sm text-zinc-400">Add roles you want to highlight.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={draft.role}
            onChange={(e) => setDraft((s) => ({ ...s, role: e.target.value }))}
            placeholder="Role"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            value={draft.organization}
            onChange={(e) => setDraft((s) => ({ ...s, organization: e.target.value }))}
            placeholder="Organization"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </div>
        <input
          value={draft.period}
          onChange={(e) => setDraft((s) => ({ ...s, period: e.target.value }))}
          placeholder="Period (e.g. 2024–2026)"
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <textarea
          value={draft.description}
          onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
          placeholder="Description"
          className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <div className="mt-3">
          <button
            type="button"
            disabled={busy || !(draft.role || "").trim() || !(draft.organization || "").trim()}
            onClick={async () => {
              setBusy(true);
              try {
                const created = await createExperience({
                  role: draft.role.trim(),
                  organization: draft.organization.trim(),
                  period: draft.period,
                  description: draft.description,
                  sort_order: 0,
                });
                setExperience((list) => [...list, created]);
                setDraft({ role: "", organization: "", period: "", description: "" });
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-full border border-white/10 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[color:var(--accent)]/15 disabled:opacity-50"
          >
            Add experience
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {experience.map((ex) => (
          <div key={ex.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={ex.role}
                onChange={(e) => setExperience((list) => list.map((x) => (x.id === ex.id ? { ...x, role: e.target.value } : x)))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
              />
              <input
                value={ex.organization}
                onChange={(e) =>
                  setExperience((list) => list.map((x) => (x.id === ex.id ? { ...x, organization: e.target.value } : x)))
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
              />
            </div>
            <input
              value={ex.period}
              onChange={(e) => setExperience((list) => list.map((x) => (x.id === ex.id ? { ...x, period: e.target.value } : x)))}
              placeholder="Period"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
            />
            <textarea
              value={ex.description}
              onChange={(e) => setExperience((list) => list.map((x) => (x.id === ex.id ? { ...x, description: e.target.value } : x)))}
              placeholder="Description"
              className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const saved = await updateExperience(ex.id, {
                      role: ex.role,
                      organization: ex.organization,
                      period: ex.period,
                      description: ex.description,
                    });
                    setExperience((list) => list.map((x) => (x.id === ex.id ? saved : x)));
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
                    await deleteExperience(ex.id);
                    setExperience((list) => list.filter((x) => x.id !== ex.id));
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
        {experience.length === 0 && <div className="text-sm text-zinc-400">No experience yet.</div>}
      </div>
    </section>
  );
}

