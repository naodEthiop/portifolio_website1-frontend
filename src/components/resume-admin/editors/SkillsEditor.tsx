import { useState, type Dispatch, type SetStateAction } from "react";
import { createSkill, deleteSkill, updateSkill, type SkillRow } from "@/lib/supabase/resume";

type Props = {
  skills: SkillRow[];
  setSkills: Dispatch<SetStateAction<SkillRow[]>>;
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
};

function sortByCategoryThenName(skills: SkillRow[]) {
  return [...skills].sort((a, b) => a.category.localeCompare(b.category) || a.skill_name.localeCompare(b.skill_name));
}

export function SkillsEditor({ skills, setSkills, busy, setBusy }: Props) {
  const sorted = sortByCategoryThenName(skills);
  const [draft, setDraft] = useState({ category: "Software", skill_name: "", proficiency: 3 });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Skills</h2>
          <p className="mt-2 text-sm text-zinc-400">Proficiency is 1–5.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={draft.category}
            onChange={(e) => setDraft((s) => ({ ...s, category: e.target.value }))}
            placeholder="Category"
            className="w-44 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            value={draft.skill_name}
            onChange={(e) => setDraft((s) => ({ ...s, skill_name: e.target.value }))}
            placeholder="Skill name"
            className="w-56 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            value={draft.proficiency}
            onChange={(e) => setDraft((s) => ({ ...s, proficiency: Number(e.target.value) }))}
            type="number"
            min={1}
            max={5}
            className="w-24 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
          />
          <button
            type="button"
            disabled={busy || !(draft.skill_name || "").trim()}
            onClick={async () => {
              setBusy(true);
              try {
                const created = await createSkill({
                  category: draft.category || "Skills",
                  skill_name: draft.skill_name.trim(),
                  proficiency: Math.max(1, Math.min(5, draft.proficiency || 3)),
                  sort_order: 0,
                });
                setSkills((s) => [...s, created]);
                setDraft((s) => ({ ...s, skill_name: "" }));
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-full border border-white/10 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[color:var(--accent)]/15 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {sorted.map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-center">
              <input
                value={s.category}
                onChange={(e) => setSkills((list) => list.map((x) => (x.id === s.id ? { ...x, category: e.target.value } : x)))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
              />
              <input
                value={s.skill_name}
                onChange={(e) => setSkills((list) => list.map((x) => (x.id === s.id ? { ...x, skill_name: e.target.value } : x)))}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
              />
              <input
                value={s.proficiency}
                onChange={(e) => setSkills((list) => list.map((x) => (x.id === s.id ? { ...x, proficiency: Number(e.target.value) } : x)))}
                type="number"
                min={1}
                max={5}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const saved = await updateSkill(s.id, {
                        category: s.category,
                        skill_name: s.skill_name,
                        proficiency: Math.max(1, Math.min(5, s.proficiency)),
                      });
                      setSkills((list) => list.map((x) => (x.id === s.id ? saved : x)));
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
                      await deleteSkill(s.id);
                      setSkills((list) => list.filter((x) => x.id !== s.id));
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
          </div>
        ))}
        {sorted.length === 0 && <div className="text-sm text-zinc-400">No skills yet.</div>}
      </div>
    </section>
  );
}
