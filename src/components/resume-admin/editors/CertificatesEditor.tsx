import { useState, type Dispatch, type SetStateAction } from "react";
import { createCertificate, deleteCertificate, updateCertificate, type CertificateRow } from "@/lib/supabase/resume";

type Props = {
  certificates: CertificateRow[];
  setCertificates: Dispatch<SetStateAction<CertificateRow[]>>;
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
};

export function CertificatesEditor({ certificates, setCertificates, busy, setBusy }: Props) {
  const [draft, setDraft] = useState({ name: "", issuer: "", date: "", description: "" });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Certificates</h2>
        <p className="mt-2 text-sm text-zinc-400">Optional date.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={draft.name}
            onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))}
            placeholder="Name"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            value={draft.issuer}
            onChange={(e) => setDraft((s) => ({ ...s, issuer: e.target.value }))}
            placeholder="Issuer"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            value={draft.date}
            onChange={(e) => setDraft((s) => ({ ...s, date: e.target.value }))}
            type="date"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
          />
        </div>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
          placeholder="Description"
          className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <div className="mt-3">
          <button
            type="button"
            disabled={busy || !(draft.name || "").trim()}
            onClick={async () => {
              setBusy(true);
              try {
                const created = await createCertificate({
                  name: draft.name.trim(),
                  issuer: draft.issuer,
                  date: draft.date ? draft.date : null,
                  description: draft.description,
                  sort_order: 0,
                });
                setCertificates((list) => [...list, created]);
                setDraft({ name: "", issuer: "", date: "", description: "" });
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-full border border-white/10 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[color:var(--accent)]/15 disabled:opacity-50"
          >
            Add certificate
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {certificates.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <input
              value={c.name}
              onChange={(e) => setCertificates((list) => list.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
            />
            <input
              value={c.issuer}
              onChange={(e) => setCertificates((list) => list.map((x) => (x.id === c.id ? { ...x, issuer: e.target.value } : x)))}
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
            />
            <input
              value={c.date || ""}
              onChange={(e) => setCertificates((list) => list.map((x) => (x.id === c.id ? { ...x, date: e.target.value || null } : x)))}
              type="date"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
            />
            <textarea
              value={c.description}
              onChange={(e) => setCertificates((list) => list.map((x) => (x.id === c.id ? { ...x, description: e.target.value } : x)))}
              className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const saved = await updateCertificate(c.id, {
                      name: c.name,
                      issuer: c.issuer,
                      date: c.date,
                      description: c.description,
                    });
                    setCertificates((list) => list.map((x) => (x.id === c.id ? saved : x)));
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
                    await deleteCertificate(c.id);
                    setCertificates((list) => list.filter((x) => x.id !== c.id));
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
        {certificates.length === 0 && <div className="text-sm text-zinc-400">No certificates yet.</div>}
      </div>
    </section>
  );
}

