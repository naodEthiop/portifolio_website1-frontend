import type { Dispatch, SetStateAction } from "react";
import { upsertPersonalInfo, type PersonalInfoRow } from "@/lib/supabase/resume";

type Props = {
  personal: Partial<PersonalInfoRow> | null;
  setPersonal: Dispatch<SetStateAction<Partial<PersonalInfoRow> | null>>;
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
};

export function PersonalInfoEditor({ personal, setPersonal, busy, setBusy }: Props) {
  const save = async () => {
    if (!personal) return;
    setBusy(true);
    try {
      const saved = await upsertPersonalInfo({
        id: personal.id,
        name: personal.name || "",
        title: personal.title || "",
        summary: personal.summary || "",
        email: personal.email || "",
        phone: personal.phone || "",
        linkedin: personal.linkedin || "",
        github: personal.github || "",
        portfolio: personal.portfolio || "",
      });
      setPersonal(saved);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Personal Info</h2>
          <p className="mt-2 text-sm text-zinc-400">This is the header of your resume.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={busy || !(personal?.name || "").trim()}
          className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 disabled:opacity-50"
        >
          Save
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          value={personal?.name || ""}
          onChange={(e) => setPersonal((s) => ({ ...(s || {}), name: e.target.value }))}
          placeholder="Name"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={personal?.title || ""}
          onChange={(e) => setPersonal((s) => ({ ...(s || {}), title: e.target.value }))}
          placeholder="Title"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
      </div>
      <textarea
        value={personal?.summary || ""}
        onChange={(e) => setPersonal((s) => ({ ...(s || {}), summary: e.target.value }))}
        placeholder="Summary"
        className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          value={personal?.email || ""}
          onChange={(e) => setPersonal((s) => ({ ...(s || {}), email: e.target.value }))}
          placeholder="Email"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={personal?.phone || ""}
          onChange={(e) => setPersonal((s) => ({ ...(s || {}), phone: e.target.value }))}
          placeholder="Phone"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={personal?.linkedin || ""}
          onChange={(e) => setPersonal((s) => ({ ...(s || {}), linkedin: e.target.value }))}
          placeholder="LinkedIn URL"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={personal?.github || ""}
          onChange={(e) => setPersonal((s) => ({ ...(s || {}), github: e.target.value }))}
          placeholder="GitHub URL"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
        />
        <input
          value={personal?.portfolio || ""}
          onChange={(e) => setPersonal((s) => ({ ...(s || {}), portfolio: e.target.value }))}
          placeholder="Portfolio URL"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500 sm:col-span-2"
        />
      </div>
    </section>
  );
}

