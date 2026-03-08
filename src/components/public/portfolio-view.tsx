import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AwardItem, Certificate, ContactResponse, Profile, PublicProjectsResponse, Skill, TeachingItem } from "@/lib/api/types";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const apiOrigin = apiBaseURL.replace(/\/api\/v1\/?$/, "");

function assetURL(path?: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

function CertificateMedia({
  imageURL,
  alt,
  fit = "cover",
  className = "",
}: {
  imageURL?: string;
  alt: string;
  fit?: "cover" | "contain";
  className?: string;
}) {
  const svgFallback =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#0d1117"/>
            <stop offset="1" stop-color="#161b22"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <rect x="56" y="56" width="688" height="488" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
        <text x="400" y="315" text-anchor="middle" fill="rgba(255,255,255,0.70)" font-family="Inter,system-ui,Segoe UI,Roboto" font-size="24" font-weight="600">
          CERTIFICATE
        </text>
      </svg>`,
    );

  const candidates = useMemo(() => {
    const list: string[] = [];
    if (imageURL) {
      const resolved = assetURL(imageURL);
      if (resolved) list.push(resolved);
      if (resolved.endsWith(".avif")) list.push(resolved.replace(/\.avif$/i, ".jpg"));
      if (resolved.endsWith(".webp")) list.push(resolved.replace(/\.webp$/i, ".jpg"));
    }
    list.push(assetURL("/uploads/certificates/placeholder.avif"));
    list.push(svgFallback);
    return Array.from(new Set(list)).filter(Boolean);
  }, [imageURL, svgFallback]);

  const [index, setIndex] = useState(0);
  const src = candidates[index] || "";
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={[
        "h-full w-full",
        fit === "contain" ? "object-contain" : "object-cover",
        fit === "cover" ? "transition duration-500 ease-out group-hover:scale-[1.02]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      loading="lazy"
      onError={() => setIndex((i) => Math.min(i + 1, candidates.length - 1))}
    />
  );
}

const FALLBACK_SOCIAL: Array<{ platform: string; url: string }> = [
  { platform: "Telegram", url: "https://t.me/Naod2i" },
  { platform: "Telegram Channel", url: "https://t.me/naodbuilds" },
  { platform: "LinkedIn", url: "https://www.linkedin.com/in/fkremariam-fentahun-b9a902390" },
  { platform: "Upwork", url: "https://www.upwork.com/freelancers/~01531376e3abd2dc50?mp_source=share" },
  { platform: "GitHub", url: "https://github.com/naodEthiop" },
  { platform: "Twitter", url: "https://twitter.com/naodEthiop" },
  { platform: "Reddit", url: "https://www.reddit.com/user/naodEthiop" },
  { platform: "Dev.to", url: "https://dev.to/naodEthiop" },
  { platform: "YouTube", url: "https://www.youtube.com/@NaodBuilds" },
];

type Props = {
  profile: Profile;
  contact: ContactResponse | null;
  projects: PublicProjectsResponse | null;
  certificates: Certificate[];
  skills: Skill[];
  teaching: TeachingItem[];
  awards: AwardItem[];
  loading?: boolean;
};

function monthYear(dateString?: string) {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function prettyNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function socialUrl(social: Array<{ platform: string; url: string }>, platform: string) {
  return social.find((s) => s.platform.toLowerCase() === platform.toLowerCase())?.url;
}

function byIsoDateDesc(a?: string, b?: string) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(b).getTime() - new Date(a).getTime();
}

function groupedSkills(skills: Skill[]) {
  const out = new Map<string, Skill[]>();
  for (const skill of skills) {
    const list = out.get(skill.category) || [];
    list.push(skill);
    out.set(skill.category, list);
  }
  for (const [category, list] of out.entries()) {
    list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));
    out.set(category, list);
  }
  return Array.from(out.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function stripMarkdownLite(input: string) {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/^\|.*\|$/gm, "")
    .replace(/^\s*[:\-| ]+\s*$/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^---\s*$/gm, "")
    .replace(/^\-\s+/gm, "\u2022 ")
    .trim();
}

function renderInlineStrong(text: string) {
  const out: Array<string | { strong: string }> = [];
  let remaining = text;
  while (remaining.length > 0) {
    const start = remaining.indexOf("**");
    if (start === -1) {
      out.push(remaining);
      break;
    }
    const end = remaining.indexOf("**", start + 2);
    if (end === -1) {
      out.push(remaining);
      break;
    }
    if (start > 0) out.push(remaining.slice(0, start));
    out.push({ strong: remaining.slice(start + 2, end) });
    remaining = remaining.slice(end + 2);
  }
  return out.map((part, idx) =>
    typeof part === "string" ? (
      <span key={`t-${idx}`}>{part}</span>
    ) : (
      <strong key={`b-${idx}`} className="font-semibold text-white">
        {part.strong}
      </strong>
    ),
  );
}

type BioBlock =
  | { kind: "h1" | "h2" | "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "hr" }
  | { kind: "quote"; text: string };

function parseBioMarkdown(input: string): BioBlock[] {
  const mojibake = /(?:\u00f0\u0178|\u00ef\u00b8|\u00e2\u20ac)/;
  const src = (input || "").replace(/\r\n/g, "\n");
  const lines = src.split("\n").map((l) => l.replace(/\s+$/g, ""));

  const blocks: BioBlock[] = [];
  let i = 0;

  const isHeading = (line: string) => /^#{1,3}\s+/.test(line);
  const isList = (line: string) => /^\-\s+/.test(line);
  const isQuote = (line: string) => /^>\s+/.test(line);
  const isHr = (line: string) => line.trim() === "---";

  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }
    if (mojibake.test(line)) {
      i += 1;
      continue;
    }

    if (isHr(line)) {
      blocks.push({ kind: "hr" });
      i += 1;
      continue;
    }

    if (isHeading(line)) {
      const level = line.startsWith("###") ? "h3" : line.startsWith("##") ? "h2" : "h1";
      blocks.push({ kind: level, text: line.replace(/^#{1,3}\s+/, "").trim() });
      i += 1;
      continue;
    }

    if (isList(line)) {
      const items: string[] = [];
      while (i < lines.length && isList((lines[i] ?? "").trim())) {
        const item = (lines[i] ?? "").trim().replace(/^\-\s+/, "").trim();
        if (item && !mojibake.test(item)) items.push(item);
        i += 1;
      }
      if (items.length > 0) blocks.push({ kind: "ul", items });
      continue;
    }

    if (isQuote(line)) {
      const parts: string[] = [];
      while (i < lines.length && isQuote((lines[i] ?? "").trim())) {
        parts.push((lines[i] ?? "").trim().replace(/^>\s+/, ""));
        i += 1;
      }
      const text = parts.join(" ").trim();
      if (text) blocks.push({ kind: "quote", text });
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = (lines[i] ?? "").trim();
      if (!current) break;
      if (mojibake.test(current)) {
        i += 1;
        continue;
      }
      if (isHeading(current) || isList(current) || isQuote(current) || isHr(current)) break;
      paragraphLines.push(current);
      i += 1;
    }
    const text = paragraphLines.join(" ").trim();
    if (text) blocks.push({ kind: "p", text });
  }

  return blocks;
}

export function PortfolioView({ profile, contact, projects, certificates, skills, teaching, awards, loading }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const visibleSocial = (contact?.social_links || []).filter((s) => s.visible);
  const social = visibleSocial.length > 0 ? visibleSocial.map((s) => ({ platform: s.platform, url: s.url })) : FALLBACK_SOCIAL;
  const pinned = projects?.pinned || [];
  const allProjects = (projects?.projects || []).filter((p) => !p.pinned);
  const sortedCertificates = [...certificates].sort((a, b) => byIsoDateDesc(a.issue_date, b.issue_date));
  const skillGroups = groupedSkills(skills);
  const upwork = socialUrl(social, "Upwork");
  const telegram = socialUrl(social, "Telegram");
  const bioBlocks = useMemo(() => parseBioMarkdown(profile.bio || profile.summary || ""), [profile.bio, profile.summary]);
  const visibleBioBlocks = aboutExpanded ? bioBlocks : bioBlocks.slice(0, 10);
  const resolvedBannerURL = profile.banner_url ? assetURL(profile.banner_url) : "";
  const resolvedResumeURL = profile.resume_url ? assetURL(profile.resume_url) : "";
  const showBanner = Boolean(resolvedBannerURL) && !resolvedBannerURL.includes("capsule-render.vercel.app");

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!activeCertificate) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveCertificate(null);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeCertificate]);

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--fg)]">
      <div className="ambient-glow" />

      <header className="sticky top-0 z-10 border-b border-white/5 bg-black/10 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            {profile.handle || profile.full_name || "NaodEthiop"}
          </a>
          <nav className="hidden items-center gap-5 text-sm text-zinc-300 sm:flex">
            <button type="button" onClick={() => scrollToId("about")} className="hidden hover:text-white sm:inline">
              About
            </button>
            <button type="button" onClick={() => scrollToId("skills")} className="hidden hover:text-white sm:inline">
              Skills
            </button>
            <button type="button" onClick={() => scrollToId("projects")} className="hover:text-white">
              Projects
            </button>
            <a href="/resume" className="hover:text-white">
              Resume
            </a>
            <button type="button" onClick={() => scrollToId("certificates")} className="hidden hover:text-white sm:inline">
              Certificates
            </button>
            <button type="button" onClick={() => scrollToId("teaching")} className="hidden hover:text-white sm:inline">
              Teaching
            </button>
            <button type="button" onClick={() => scrollToId("awards")} className="hidden hover:text-white sm:inline">
              Awards
            </button>
            <button type="button" onClick={() => scrollToId("contact")} className="hover:text-white">
              Contact
            </button>
          </nav>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((s) => !s)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 sm:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm sm:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="mx-4 mt-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Navigate</div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200"
              >
                Close
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              <a
                href="/resume"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-100"
              >
                Resume
              </a>
              {["about", "skills", "projects", "certificates", "teaching", "awards", "contact"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToId(id);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-100"
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-12">
        {showBanner && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
            <img
              src={resolvedBannerURL}
              alt="Hero banner"
              className="h-[170px] w-full object-cover opacity-90 sm:h-[210px]"
              loading="lazy"
            />
          </div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="pb-12"
        >
          <div className="grid gap-10 md:grid-cols-[1fr_240px] md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">{profile.location || "Addis Ababa, Ethiopia"}</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                <span className="bg-gradient-to-b from-white via-white to-[var(--accent)] bg-clip-text text-transparent">
                  {profile.headline || "Software Engineer | Go Backend Developer | Cyber security Enthusiast"}
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-zinc-300">
                {profile.summary || "Clean systems, secure defaults, and practical UX."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {social.slice(0, 4).map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    {s.platform}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => scrollToId("projects")}
                  className="rounded-full border border-white/10 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)] transition hover:bg-[color:var(--accent)]/15"
                >
                  View projects
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollToId("contact")}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
                >
                  {profile.cta_primary || "Hire me"}
                </button>
                {resolvedResumeURL && (
                  <a
                    href={resolvedResumeURL}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                  >
                    Resume
                  </a>
                )}
                {upwork && (
                  <a
                    href={upwork}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                  >
                    {profile.cta_secondary || "Request a quote"}
                  </a>
                )}
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                  >
                    {profile.cta_tertiary || "15-min call"}
                  </a>
                )}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <img
                  alt="profile views"
                  src="https://komarev.com/ghpvc/?username=naodEthiop&color=00ADD8&style=flat-square&label=ENCRYPTED+VISITS"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="relative">
              <div className="mx-auto h-[240px] w-[240px] overflow-hidden rounded-[999px] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
                <div className="absolute inset-0 rounded-[999px] bg-gradient-to-b from-white/10 to-transparent" />
                <div className="absolute inset-[-60px] -z-10 rounded-[999px] bg-[radial-gradient(circle_at_30%_20%,rgba(0,173,216,0.25),transparent_55%)] blur-2xl" />
                {profile.avatar_url ? (
                  <img
                    src={assetURL(profile.avatar_url)}
                    alt={profile.full_name || "Profile"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/20 text-4xl font-semibold text-white/60">
                    {(profile.full_name || "N").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mx-auto mt-4 max-w-[260px] rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-zinc-300">
                {profile.handle || "NaodEthiop"} {"\u2022"} {profile.full_name || "Fkremariam Fentahun"}
              </div>
            </div>
          </div>
        </motion.section>

        <section id="about" className="scroll-mt-24 pt-2">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">About</h2>
              <div className="mt-4 max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="space-y-5 text-sm leading-7 text-zinc-200">
                  {visibleBioBlocks.map((b, idx) => {
                    if (b.kind === "hr") return <hr key={`bio-${idx}`} className="border-white/10" />;
                    if (b.kind === "h1")
                      return (
                        <div key={`bio-${idx}`} className="text-base font-semibold tracking-tight text-white sm:text-lg">
                          {renderInlineStrong(b.text)}
                        </div>
                      );
                    if (b.kind === "h2")
                      return (
                        <div key={`bio-${idx}`} className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-300">
                          {renderInlineStrong(b.text)}
                        </div>
                      );
                    if (b.kind === "h3")
                      return (
                        <div key={`bio-${idx}`} className="text-sm font-semibold text-white">
                          {renderInlineStrong(b.text)}
                        </div>
                      );
                    if (b.kind === "quote")
                      return (
                        <blockquote key={`bio-${idx}`} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-zinc-200">
                          {renderInlineStrong(b.text)}
                        </blockquote>
                      );
                    if (b.kind === "ul")
                      return (
                        <ul key={`bio-${idx}`} className="space-y-2">
                          {b.items.map((item, j) => (
                            <li key={`bio-${idx}-${j}`} className="flex gap-2 text-zinc-200">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                              <span className="min-w-0">{renderInlineStrong(item)}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    return (
                      <p key={`bio-${idx}`} className="text-zinc-200">
                        {renderInlineStrong(b.text)}
                      </p>
                    );
                  })}
                </div>

                {bioBlocks.length > visibleBioBlocks.length && (
                  <button
                    type="button"
                    onClick={() => setAboutExpanded(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    Read more {"\u2192"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="scroll-mt-24 pt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Skills</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {skillGroups.map(([category, list]) => (
              <div key={category} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{category}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {list.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-xs text-zinc-200"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="scroll-mt-24 pt-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Projects</h2>
              <p className="mt-2 text-sm text-zinc-400">Pinned first, then everything else.</p>
            </div>
            <a
              href="https://github.com/naodEthiop?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="hidden text-sm text-zinc-400 transition hover:text-white sm:inline"
            >
              View on GitHub
            </a>
          </div>

          {pinned.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Featured Projects</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {pinned.slice(0, 4).map((project) => (
                  <motion.article
                    key={`pinned-${project.id}`}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-base font-semibold text-white transition group-hover:text-[var(--accent)]"
                          title={project.name}
                        >
                          {project.name}
                        </a>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">
                          {project.description || "No description provided yet."}
                        </p>
                      </div>
                      {project.stars > 0 && (
                        <div className="shrink-0 text-right text-xs text-zinc-400">
                          <div>
                            {"\u2605"} {prettyNumber(project.stars)}
                          </div>
                          <div className="mt-1">
                            {"\u2442"} {prettyNumber(project.forks)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {(project.tech_stack || []).slice(0, 5).map((t) => (
                        <span key={`${project.id}-${t}`} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">
                          {t}
                        </span>
                      ))}
                      {(project.repo_url || project.demo_url) && (
                        <div className="ml-auto flex items-center gap-3">
                          {project.repo_url && (
                            <a
                              href={project.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-zinc-400 transition hover:text-white"
                            >
                              Repo {"\u2192"}
                            </a>
                          )}
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-[var(--accent)] transition hover:text-white"
                            >
                              Live {"\u2192"}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            className="mt-8 grid gap-4 sm:grid-cols-2"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="h-[170px] rounded-2xl border border-white/10 bg-white/5 shadow-[0_1px_0_rgba(255,255,255,0.05)]"
                  />
                ))
              : allProjects.map((project) => {
                  const stack = (project.tech_stack || []).filter(Boolean).slice(0, 4);
                  const updated = monthYear(project.updated_at);

                  return (
                    <motion.article
                      key={project.id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-5 shadow-[0_1px_0_rgba(255,255,255,0.05)] transition hover:border-white/20"
                    >
                      {project.pinned && (
                        <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-200">
                          Pinned
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-base font-semibold text-white transition group-hover:text-[var(--accent)]"
                            title={project.name}
                          >
                            {project.name}
                          </a>
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">
                            {project.description || "No description provided yet."}
                          </p>
                        </div>

                        <div className="shrink-0 text-right text-xs text-zinc-400">
                          <div>{updated}</div>
                          {project.stars > 0 && (
                            <div className="mt-2 flex items-center justify-end gap-3">
                              <span title="Stars">
                                {"\u2605"} {prettyNumber(project.stars)}
                              </span>
                              <span title="Forks">
                                {"\u2442"} {prettyNumber(project.forks)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {project.language && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200">
                            {project.language}
                          </span>
                        )}
                        {stack.map((item) => (
                          <span
                            key={`${project.id}-${item}`}
                            className="rounded-full border border-white/10 bg-white/0 px-2.5 py-1 text-xs text-zinc-400"
                          >
                            {item}
                          </span>
                        ))}
                        {(project.repo_url || project.demo_url) && (
                          <div className="ml-auto flex items-center gap-3">
                            {project.repo_url && (
                              <a
                                href={project.repo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-zinc-400 transition hover:text-white"
                              >
                                Repo {"\u2192"}
                              </a>
                            )}
                            {project.demo_url && (
                              <a
                                href={project.demo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[var(--accent)] transition hover:text-[var(--fg)]"
                              >
                                Live {"\u2192"}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
          </motion.div>
        </section>

        <section id="certificates" className="scroll-mt-24 pt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Certificates</h2>
          <p className="mt-2 text-sm text-zinc-400">Newest first.</p>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`cert-skel-${idx}`}
                    className="h-[140px] rounded-2xl border border-white/10 bg-white/5"
                  />
                ))
              : sortedCertificates.map((cert) => (
                  <motion.article
                    key={cert.id}
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveCertificate(cert)}
                      className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-black/20 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      aria-haspopup="dialog"
                      aria-label={`Preview certificate: ${cert.name}`}
                    >
                      <CertificateMedia imageURL={cert.image_url} alt={cert.name} />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] text-zinc-200 opacity-0 backdrop-blur transition group-hover:opacity-100">
                        Click to enlarge
                      </div>
                    </button>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{cert.name}</div>
                          <div className="mt-1 truncate text-xs text-zinc-400">{cert.issuer}</div>
                        </div>
                        <div className="shrink-0 text-xs text-zinc-500">{monthYear(cert.issue_date)}</div>
                      </div>

                      {cert.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">{cert.description}</p>}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-zinc-500">Credential</div>
                        {cert.credential_url && (
                          <a className="text-xs text-[var(--accent)] hover:text-white" href={cert.credential_url} target="_blank" rel="noreferrer">
                            Open {"\u2192"}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
          </motion.div>

          {!loading && sortedCertificates.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400">
              No certificates yet. Add them from the admin dashboard.
            </div>
          )}
        </section>

        <AnimatePresence>
          {activeCertificate && (
            <motion.div
              key="certificate-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-label={`Certificate preview: ${activeCertificate.name}`}
              onClick={() => setActiveCertificate(null)}
            >
              <motion.div
                initial={{ y: 12, scale: 0.98, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 12, scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{activeCertificate.name}</div>
                    <div className="mt-1 truncate text-xs text-zinc-400">
                      {activeCertificate.issuer}
                      {activeCertificate.issue_date ? ` • ${monthYear(activeCertificate.issue_date)}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeCertificate.credential_url && (
                      <a
                        className="hidden text-xs text-[var(--accent)] hover:text-white sm:inline"
                        href={activeCertificate.credential_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Credential {"\u2192"}
                      </a>
                    )}
                    <button
                      type="button"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
                      onClick={() => setActiveCertificate(null)}
                      aria-label="Close certificate preview"
                      autoFocus
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 p-3 sm:p-5">
                  <div className="flex max-h-[76vh] items-center justify-center overflow-auto rounded-xl border border-white/10 bg-black/20 p-3">
                    <CertificateMedia
                      imageURL={activeCertificate.image_url}
                      alt={activeCertificate.name}
                      fit="contain"
                      className="h-auto w-auto max-h-[72vh] max-w-full rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <section id="teaching" className="scroll-mt-24 pt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Teaching</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(teaching || []).filter((t) => t.visible).map((t) => (
              <motion.article
                key={t.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20"
              >
                <div className="text-sm font-semibold text-white">{t.title}</div>
                <div className="mt-1 text-xs text-zinc-400">
                  {t.organization}
                  {t.location ? ` \u2022 ${t.location}` : ""}
                </div>
                {t.description && <p className="mt-3 text-sm leading-6 text-zinc-300">{t.description}</p>}
                {t.link_url && (
                  <a className="mt-3 inline-block text-xs text-[var(--accent)] hover:text-white" href={t.link_url} target="_blank" rel="noreferrer">
                    Link {"\u2192"}
                  </a>
                )}
              </motion.article>
            ))}
            {!loading && (teaching || []).filter((t) => t.visible).length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400">
                Add teaching items from the admin dashboard.
              </div>
            )}
          </div>
        </section>

        <section id="awards" className="scroll-mt-24 pt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Awards</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(awards || []).filter((a) => a.visible).map((a) => (
              <motion.article
                key={a.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{a.title}</div>
                    <div className="mt-1 text-xs text-zinc-400">{a.issuer}</div>
                  </div>
                  <div className="shrink-0 text-xs text-zinc-500">{monthYear(a.award_date)}</div>
                </div>
                {a.description && <p className="mt-3 text-sm leading-6 text-zinc-300">{a.description}</p>}
                {a.link_url && (
                  <a className="mt-3 inline-block text-xs text-[var(--accent)] hover:text-white" href={a.link_url} target="_blank" rel="noreferrer">
                    Link {"\u2192"}
                  </a>
                )}
              </motion.article>
            ))}
            {!loading && (awards || []).filter((a) => a.visible).length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400">
                Add awards from the admin dashboard.
              </div>
            )}
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 pt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Contact</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Reach out via the links below.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {social.map((s) => (
              <a
                key={`${s.platform}-${s.url}`}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
              >
                {s.platform}
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-white/5 pt-8 text-xs text-zinc-500">
          {"\u00A9"} {new Date().getFullYear()} {profile.full_name || "Portfolio"}
        </footer>
      </main>
    </div>
  );
}
