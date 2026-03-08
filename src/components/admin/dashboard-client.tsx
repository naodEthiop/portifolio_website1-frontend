import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAward,
  createCertificate,
  createProject,
  createSkill,
  createSocialLink,
  createTeaching,
  deleteAward,
  deleteCertificate,
  deleteProject,
  deleteSkill,
  deleteSocialLink,
  deleteTeaching,
  listAdminAwards,
  listAdminProjects,
  listAdminTeaching,
  listAdminSocialLinks,
  toggleFeatured,
  updateAward,
  updateCertificate,
  updateProject,
  updateSkill,
  updateSocialLink,
  updateTeaching,
  upsertProfile,
  uploadCertificateImage,
  uploadProjectImage,
} from "@/lib/api/admin";
import { getCertificates, getPublicProfile, getSkills } from "@/lib/api/public";
import type { AwardItem, Certificate, Profile, Project, Skill, SocialLink, TeachingItem } from "@/lib/api/types";
import { clearAdminToken, readAdminToken } from "@/lib/auth/token";
import { signalContentUpdated } from "@/lib/content-updates";

const sectionClass = "panel rounded-xl p-5";
type ProjectStatus = "complete" | "in_progress" | "archived";

export function DashboardClient() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teaching, setTeaching] = useState<TeachingItem[]>([]);
  const [awards, setAwards] = useState<AwardItem[]>([]);

  const [projectInput, setProjectInput] = useState({
    title: "",
    short_description: "",
    description: "",
    status: "in_progress" as ProjectStatus,
    tech_stack: "",
    achievements: "",
    demo_url: "",
    repo_url: "",
    featured: false,
  });

  const [certificateInput, setCertificateInput] = useState({
    name: "",
    issuer: "",
    issue_date: "",
    description: "",
    credential_url: "",
  });

  const [profileInput, setProfileInput] = useState({
    full_name: "",
    handle: "",
    headline: "",
    location: "",
    summary: "",
    bio: "",
    avatar_url: "",
    banner_url: "",
    resume_url: "",
    cta_primary: "",
    cta_secondary: "",
    cta_tertiary: "",
  });

  const [skillInput, setSkillInput] = useState({ category: "Software", name: "", sort_order: 0 });
  const [socialInput, setSocialInput] = useState({ platform: "", url: "", sort_order: 0, visible: true });
  const [teachingInput, setTeachingInput] = useState({
    title: "",
    organization: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    link_url: "",
    sort_order: 0,
    visible: true,
  });
  const [awardInput, setAwardInput] = useState({
    title: "",
    issuer: "",
    award_date: "",
    description: "",
    link_url: "",
    sort_order: 0,
    visible: true,
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [editingTeachingId, setEditingTeachingId] = useState<string | null>(null);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);

  const refreshData = async (activeToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProfile, fetchedProjects, fetchedCertificates, fetchedSkills, fetchedLinks] = await Promise.all([
        getPublicProfile(),
        listAdminProjects(activeToken),
        getCertificates(),
        getSkills(),
        listAdminSocialLinks(activeToken),
      ]);
      const [fetchedTeaching, fetchedAwards] = await Promise.all([listAdminTeaching(activeToken), listAdminAwards(activeToken)]);
      setProfile(fetchedProfile);
      setProfileInput({
        full_name: fetchedProfile.full_name || "",
        handle: fetchedProfile.handle || "",
        headline: fetchedProfile.headline || "",
        location: fetchedProfile.location || "",
        summary: fetchedProfile.summary || "",
        bio: fetchedProfile.bio || "",
        avatar_url: fetchedProfile.avatar_url || "",
        banner_url: fetchedProfile.banner_url || "",
        resume_url: fetchedProfile.resume_url || "",
        cta_primary: fetchedProfile.cta_primary || "",
        cta_secondary: fetchedProfile.cta_secondary || "",
        cta_tertiary: fetchedProfile.cta_tertiary || "",
      });
      setProjects(fetchedProjects);
      setCertificates(fetchedCertificates);
      setSkills(fetchedSkills);
      setSocialLinks(fetchedLinks);
      setTeaching(fetchedTeaching);
      setAwards(fetchedAwards);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        clearAdminToken();
        navigate("/admin/login");
        return;
      }
      setError(err?.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = readAdminToken();
    if (!storedToken) {
      navigate("/admin/login");
      return;
    }
    setToken(storedToken);
    refreshData(storedToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(
    () => [
      { label: "Projects", value: projects.length },
      { label: "Certificates", value: certificates.length },
      { label: "Skills", value: skills.length },
      { label: "Social Links", value: socialLinks.length },
      { label: "Teaching", value: teaching.length },
      { label: "Awards", value: awards.length },
    ],
    [projects.length, certificates.length, skills.length, socialLinks.length, teaching.length, awards.length],
  );

  const requireToken = () => {
    if (!token) {
      setError("Session expired");
      navigate("/admin/login");
      return null;
    }
    return token;
  };

  const onCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...projectInput,
        tech_stack: projectInput.tech_stack.split(",").map((i) => i.trim()).filter(Boolean),
        achievements: projectInput.achievements.split(",").map((i) => i.trim()).filter(Boolean),
      };
      if (editingProjectId) {
        await updateProject(t, editingProjectId, payload);
      } else {
        await createProject(t, payload);
      }
      setProjectInput({
        title: "",
        short_description: "",
        description: "",
        status: "in_progress",
        tech_stack: "",
        achievements: "",
        demo_url: "",
        repo_url: "",
        featured: false,
      });
      setEditingProjectId(null);
      signalContentUpdated();
      await refreshData(t);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const onCreateCertificate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    try {
      if (editingCertificateId) {
        await updateCertificate(t, editingCertificateId, certificateInput);
      } else {
        await createCertificate(t, certificateInput);
      }
      setCertificateInput({ name: "", issuer: "", issue_date: "", description: "", credential_url: "" });
      setEditingCertificateId(null);
      signalContentUpdated();
      await refreshData(t);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  const onSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await upsertProfile(t, profileInput);
      setProfile(updated);
      signalContentUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const onCreateSkill = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    try {
      const payload = { ...skillInput, sort_order: Number(skillInput.sort_order) || 0 };
      if (editingSkillId) {
        await updateSkill(t, editingSkillId, payload);
      } else {
        await createSkill(t, payload);
      }
      setSkillInput({ category: "Software", name: "", sort_order: 0 });
      setEditingSkillId(null);
      signalContentUpdated();
      await refreshData(t);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save skill");
    } finally {
      setSaving(false);
    }
  };

  const onCreateSocial = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    try {
      const payload = { ...socialInput, sort_order: Number(socialInput.sort_order) || 0 };
      if (editingSocialId) {
        await updateSocialLink(t, editingSocialId, payload);
      } else {
        await createSocialLink(t, payload);
      }
      setSocialInput({ platform: "", url: "", sort_order: 0, visible: true });
      setEditingSocialId(null);
      signalContentUpdated();
      await refreshData(t);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save social link");
    } finally {
      setSaving(false);
    }
  };

  const onCreateTeaching = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    try {
      const payload = { ...teachingInput, sort_order: Number(teachingInput.sort_order) || 0 };
      if (editingTeachingId) {
        await updateTeaching(t, editingTeachingId, payload);
      } else {
        await createTeaching(t, payload);
      }
      setTeachingInput({
        title: "",
        organization: "",
        location: "",
        start_date: "",
        end_date: "",
        description: "",
        link_url: "",
        sort_order: 0,
        visible: true,
      });
      setEditingTeachingId(null);
      signalContentUpdated();
      await refreshData(t);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save teaching item");
    } finally {
      setSaving(false);
    }
  };

  const onCreateAward = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = requireToken();
    if (!t) return;
    setSaving(true);
    setError(null);
    try {
      const payload = { ...awardInput, sort_order: Number(awardInput.sort_order) || 0 };
      if (editingAwardId) {
        await updateAward(t, editingAwardId, payload);
      } else {
        await createAward(t, payload);
      }
      setAwardInput({
        title: "",
        issuer: "",
        award_date: "",
        description: "",
        link_url: "",
        sort_order: 0,
        visible: true,
      });
      setEditingAwardId(null);
      signalContentUpdated();
      await refreshData(t);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save award");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => {
    clearAdminToken();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className={`${sectionClass} text-terminal-muted`}>Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-terminal-muted">Admin Dashboard</p>
          <h1 className="text-2xl font-bold">Portfolio Control Plane</h1>
        </div>
        <button onClick={onLogout} className="rounded border border-terminal-line px-4 py-2 text-sm hover:border-terminal-accent hover:text-terminal-accent">
          Logout
        </button>
      </header>

      {error && <div className="mb-6 rounded border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className={sectionClass}>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-terminal-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-terminal-accent">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <form className={sectionClass} onSubmit={onCreateProject}>
          <h2 className="text-lg font-semibold">{editingProjectId ? "Update Project" : "Create Project"}</h2>
          <input required placeholder="Title" value={projectInput.title} onChange={(e) => setProjectInput((s) => ({ ...s, title: e.target.value }))} className="mt-3 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input required placeholder="Short description" value={projectInput.short_description} onChange={(e) => setProjectInput((s) => ({ ...s, short_description: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <textarea required placeholder="Description" value={projectInput.description} onChange={(e) => setProjectInput((s) => ({ ...s, description: e.target.value }))} className="mt-2 h-24 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <select value={projectInput.status} onChange={(e) => setProjectInput((s) => ({ ...s, status: e.target.value as ProjectStatus }))} className="rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm">
              <option value="complete">complete</option>
              <option value="in_progress">in_progress</option>
              <option value="archived">archived</option>
            </select>
            <label className="flex items-center gap-2 rounded border border-terminal-line px-3 py-2 text-xs uppercase tracking-[0.1em] text-terminal-muted">
              <input type="checkbox" checked={projectInput.featured} onChange={(e) => setProjectInput((s) => ({ ...s, featured: e.target.checked }))} /> featured
            </label>
          </div>
          <input placeholder="Tech stack (comma separated)" value={projectInput.tech_stack} onChange={(e) => setProjectInput((s) => ({ ...s, tech_stack: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Achievements (comma separated)" value={projectInput.achievements} onChange={(e) => setProjectInput((s) => ({ ...s, achievements: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Demo URL" value={projectInput.demo_url} onChange={(e) => setProjectInput((s) => ({ ...s, demo_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Repo URL" value={projectInput.repo_url} onChange={(e) => setProjectInput((s) => ({ ...s, repo_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <div className="mt-3 flex items-center gap-2">
            <button disabled={saving} className="rounded border border-terminal-accent px-4 py-2 text-sm text-terminal-accent hover:bg-terminal-accent/10 disabled:opacity-50">{editingProjectId ? "Update Project" : "Create Project"}</button>
            {editingProjectId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProjectId(null);
                  setProjectInput({
                    title: "",
                    short_description: "",
                    description: "",
                    status: "in_progress" as ProjectStatus,
                    tech_stack: "",
                    achievements: "",
                    demo_url: "",
                    repo_url: "",
                    featured: false,
                  });
                }}
                className="rounded border border-terminal-line px-4 py-2 text-sm text-terminal-muted hover:border-terminal-accent"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <form className={sectionClass} onSubmit={onCreateCertificate}>
          <h2 className="text-lg font-semibold">{editingCertificateId ? "Update Certificate" : "Create Certificate"}</h2>
          <input required placeholder="Name" value={certificateInput.name} onChange={(e) => setCertificateInput((s) => ({ ...s, name: e.target.value }))} className="mt-3 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input required placeholder="Issuer" value={certificateInput.issuer} onChange={(e) => setCertificateInput((s) => ({ ...s, issuer: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input type="date" value={certificateInput.issue_date} onChange={(e) => setCertificateInput((s) => ({ ...s, issue_date: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={certificateInput.description} onChange={(e) => setCertificateInput((s) => ({ ...s, description: e.target.value }))} className="mt-2 h-24 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Credential URL" value={certificateInput.credential_url} onChange={(e) => setCertificateInput((s) => ({ ...s, credential_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <div className="mt-3 flex items-center gap-2">
            <button disabled={saving} className="rounded border border-terminal-accent px-4 py-2 text-sm text-terminal-accent hover:bg-terminal-accent/10 disabled:opacity-50">{editingCertificateId ? "Update Certificate" : "Create Certificate"}</button>
            {editingCertificateId && (
              <button
                type="button"
                onClick={() => {
                  setEditingCertificateId(null);
                  setCertificateInput({ name: "", issuer: "", issue_date: "", description: "", credential_url: "" });
                }}
                className="rounded border border-terminal-line px-4 py-2 text-sm text-terminal-muted hover:border-terminal-accent"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <form className={sectionClass} onSubmit={onSaveProfile}>
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <input required placeholder="Full name" value={profileInput.full_name} onChange={(e) => setProfileInput((s) => ({ ...s, full_name: e.target.value }))} className="mt-3 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Handle (brand)" value={profileInput.handle} onChange={(e) => setProfileInput((s) => ({ ...s, handle: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Headline" value={profileInput.headline} onChange={(e) => setProfileInput((s) => ({ ...s, headline: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Location" value={profileInput.location} onChange={(e) => setProfileInput((s) => ({ ...s, location: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <textarea placeholder="Summary" value={profileInput.summary} onChange={(e) => setProfileInput((s) => ({ ...s, summary: e.target.value }))} className="mt-2 h-20 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <textarea placeholder="Bio" value={profileInput.bio} onChange={(e) => setProfileInput((s) => ({ ...s, bio: e.target.value }))} className="mt-2 h-24 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Avatar URL" value={profileInput.avatar_url} onChange={(e) => setProfileInput((s) => ({ ...s, avatar_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Banner URL" value={profileInput.banner_url} onChange={(e) => setProfileInput((s) => ({ ...s, banner_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Resume URL" value={profileInput.resume_url} onChange={(e) => setProfileInput((s) => ({ ...s, resume_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <input placeholder="CTA primary" value={profileInput.cta_primary} onChange={(e) => setProfileInput((s) => ({ ...s, cta_primary: e.target.value }))} className="w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <input placeholder="CTA secondary" value={profileInput.cta_secondary} onChange={(e) => setProfileInput((s) => ({ ...s, cta_secondary: e.target.value }))} className="w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <input placeholder="CTA tertiary" value={profileInput.cta_tertiary} onChange={(e) => setProfileInput((s) => ({ ...s, cta_tertiary: e.target.value }))} className="w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          </div>
          <button disabled={saving} className="mt-3 rounded border border-terminal-accent px-4 py-2 text-sm text-terminal-accent hover:bg-terminal-accent/10 disabled:opacity-50">Save Profile</button>
        </form>

        <div className={sectionClass}>
          <h2 className="text-lg font-semibold">Skills & Social Links</h2>
          <form onSubmit={onCreateSkill} className="mt-3 rounded border border-terminal-line p-3">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-terminal-muted">{editingSkillId ? "Update Skill" : "Add Skill"}</p>
            <input placeholder="Category" value={skillInput.category} onChange={(e) => setSkillInput((s) => ({ ...s, category: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <input placeholder="Skill name" value={skillInput.name} onChange={(e) => setSkillInput((s) => ({ ...s, name: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <input type="number" placeholder="Sort order" value={skillInput.sort_order} onChange={(e) => setSkillInput((s) => ({ ...s, sort_order: Number(e.target.value) }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <div className="mt-3 flex items-center gap-2">
              <button disabled={saving} className="rounded border border-terminal-accent px-3 py-1 text-sm text-terminal-accent">{editingSkillId ? "Update Skill" : "Create Skill"}</button>
              {editingSkillId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSkillId(null);
                    setSkillInput({ category: "Software", name: "", sort_order: 0 });
                  }}
                  className="rounded border border-terminal-line px-3 py-1 text-sm text-terminal-muted"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <form onSubmit={onCreateSocial} className="mt-3 rounded border border-terminal-line p-3">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-terminal-muted">{editingSocialId ? "Update Social Link" : "Add Social Link"}</p>
            <input placeholder="Platform" value={socialInput.platform} onChange={(e) => setSocialInput((s) => ({ ...s, platform: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <input placeholder="URL" value={socialInput.url} onChange={(e) => setSocialInput((s) => ({ ...s, url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input type="number" placeholder="Sort order" value={socialInput.sort_order} onChange={(e) => setSocialInput((s) => ({ ...s, sort_order: Number(e.target.value) }))} className="rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 rounded border border-terminal-line px-3 py-2 text-xs uppercase tracking-[0.1em] text-terminal-muted">
                <input type="checkbox" checked={socialInput.visible} onChange={(e) => setSocialInput((s) => ({ ...s, visible: e.target.checked }))} /> visible
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button disabled={saving} className="rounded border border-terminal-accent px-3 py-1 text-sm text-terminal-accent">{editingSocialId ? "Update Link" : "Create Link"}</button>
              {editingSocialId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSocialId(null);
                    setSocialInput({ platform: "", url: "", sort_order: 0, visible: true });
                  }}
                  className="rounded border border-terminal-line px-3 py-1 text-sm text-terminal-muted"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <form className={sectionClass} onSubmit={onCreateTeaching}>
          <h2 className="text-lg font-semibold">{editingTeachingId ? "Update Teaching" : "Add Teaching"}</h2>
          <input required placeholder="Title" value={teachingInput.title} onChange={(e) => setTeachingInput((s) => ({ ...s, title: e.target.value }))} className="mt-3 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input required placeholder="Organization" value={teachingInput.organization} onChange={(e) => setTeachingInput((s) => ({ ...s, organization: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Location" value={teachingInput.location} onChange={(e) => setTeachingInput((s) => ({ ...s, location: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input type="date" value={teachingInput.start_date} onChange={(e) => setTeachingInput((s) => ({ ...s, start_date: e.target.value }))} className="rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <input type="date" value={teachingInput.end_date} onChange={(e) => setTeachingInput((s) => ({ ...s, end_date: e.target.value }))} className="rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          </div>
          <textarea placeholder="Description" value={teachingInput.description} onChange={(e) => setTeachingInput((s) => ({ ...s, description: e.target.value }))} className="mt-2 h-24 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Link URL" value={teachingInput.link_url} onChange={(e) => setTeachingInput((s) => ({ ...s, link_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input type="number" placeholder="Sort order" value={teachingInput.sort_order} onChange={(e) => setTeachingInput((s) => ({ ...s, sort_order: Number(e.target.value) }))} className="rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 rounded border border-terminal-line px-3 py-2 text-xs uppercase tracking-[0.1em] text-terminal-muted">
              <input type="checkbox" checked={teachingInput.visible} onChange={(e) => setTeachingInput((s) => ({ ...s, visible: e.target.checked }))} /> visible
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button disabled={saving} className="rounded border border-terminal-accent px-4 py-2 text-sm text-terminal-accent hover:bg-terminal-accent/10 disabled:opacity-50">
              {editingTeachingId ? "Update Teaching" : "Add Teaching"}
            </button>
            {editingTeachingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingTeachingId(null);
                  setTeachingInput({
                    title: "",
                    organization: "",
                    location: "",
                    start_date: "",
                    end_date: "",
                    description: "",
                    link_url: "",
                    sort_order: 0,
                    visible: true,
                  });
                }}
                className="rounded border border-terminal-line px-4 py-2 text-sm text-terminal-muted hover:border-terminal-accent"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="mt-5 space-y-2">
            {teaching.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-terminal-line px-3 py-2 text-sm">
                <span>{item.title} ({item.visible ? "visible" : "hidden"})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeachingId(item.id);
                      setTeachingInput({
                        title: item.title,
                        organization: item.organization,
                        location: item.location || "",
                        start_date: item.start_date ? item.start_date.slice(0, 10) : "",
                        end_date: item.end_date ? item.end_date.slice(0, 10) : "",
                        description: item.description || "",
                        link_url: item.link_url || "",
                        sort_order: item.sort_order,
                        visible: item.visible,
                      });
                    }}
                    className="rounded border border-terminal-line px-2 py-1 text-xs hover:border-terminal-accent"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const t = requireToken();
                      if (!t) return;
                      await deleteTeaching(t, item.id);
                      signalContentUpdated();
                      await refreshData(t);
                    }}
                    className="rounded border border-red-300/40 px-2 py-1 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </form>

        <form className={sectionClass} onSubmit={onCreateAward}>
          <h2 className="text-lg font-semibold">{editingAwardId ? "Update Award" : "Add Award"}</h2>
          <input required placeholder="Title" value={awardInput.title} onChange={(e) => setAwardInput((s) => ({ ...s, title: e.target.value }))} className="mt-3 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input required placeholder="Issuer" value={awardInput.issuer} onChange={(e) => setAwardInput((s) => ({ ...s, issuer: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input type="date" value={awardInput.award_date} onChange={(e) => setAwardInput((s) => ({ ...s, award_date: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={awardInput.description} onChange={(e) => setAwardInput((s) => ({ ...s, description: e.target.value }))} className="mt-2 h-24 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <input placeholder="Link URL" value={awardInput.link_url} onChange={(e) => setAwardInput((s) => ({ ...s, link_url: e.target.value }))} className="mt-2 w-full rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input type="number" placeholder="Sort order" value={awardInput.sort_order} onChange={(e) => setAwardInput((s) => ({ ...s, sort_order: Number(e.target.value) }))} className="rounded border border-terminal-line bg-terminal-bg px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 rounded border border-terminal-line px-3 py-2 text-xs uppercase tracking-[0.1em] text-terminal-muted">
              <input type="checkbox" checked={awardInput.visible} onChange={(e) => setAwardInput((s) => ({ ...s, visible: e.target.checked }))} /> visible
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button disabled={saving} className="rounded border border-terminal-accent px-4 py-2 text-sm text-terminal-accent hover:bg-terminal-accent/10 disabled:opacity-50">
              {editingAwardId ? "Update Award" : "Add Award"}
            </button>
            {editingAwardId && (
              <button
                type="button"
                onClick={() => {
                  setEditingAwardId(null);
                  setAwardInput({
                    title: "",
                    issuer: "",
                    award_date: "",
                    description: "",
                    link_url: "",
                    sort_order: 0,
                    visible: true,
                  });
                }}
                className="rounded border border-terminal-line px-4 py-2 text-sm text-terminal-muted hover:border-terminal-accent"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="mt-5 space-y-2">
            {awards.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-terminal-line px-3 py-2 text-sm">
                <span>{item.title} ({item.visible ? "visible" : "hidden"})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAwardId(item.id);
                      setAwardInput({
                        title: item.title,
                        issuer: item.issuer,
                        award_date: item.award_date ? item.award_date.slice(0, 10) : "",
                        description: item.description || "",
                        link_url: item.link_url || "",
                        sort_order: item.sort_order,
                        visible: item.visible,
                      });
                    }}
                    className="rounded border border-terminal-line px-2 py-1 text-xs hover:border-terminal-accent"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const t = requireToken();
                      if (!t) return;
                      await deleteAward(t, item.id);
                      signalContentUpdated();
                      await refreshData(t);
                    }}
                    className="rounded border border-red-300/40 px-2 py-1 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </form>
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <article key={project.id} className="rounded border border-terminal-line p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{project.title}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProjectId(project.id);
                        setProjectInput({
                          title: project.title,
                          short_description: project.short_description,
                          description: project.description,
                          status: project.status,
                          tech_stack: project.tech_stack.join(", "),
                          achievements: project.achievements.join(", "),
                          demo_url: project.demo_url || "",
                          repo_url: project.repo_url || "",
                          featured: project.featured,
                        });
                      }}
                      className="rounded border border-terminal-line px-2 py-1 text-xs hover:border-terminal-accent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const t = requireToken();
                        if (!t) return;
                        await toggleFeatured(t, project.id, !project.featured);
                        signalContentUpdated();
                        await refreshData(t);
                      }}
                      className="rounded border border-terminal-line px-2 py-1 text-xs hover:border-terminal-accent"
                    >
                      {project.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      onClick={async () => {
                        const t = requireToken();
                        if (!t) return;
                        await deleteProject(t, project.id);
                        signalContentUpdated();
                        await refreshData(t);
                      }}
                      className="rounded border border-red-300/40 px-2 py-1 text-xs text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-terminal-muted">{project.short_description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      const t = requireToken();
                      if (!file || !t) return;
                      await uploadProjectImage(t, project.id, file);
                      signalContentUpdated();
                      await refreshData(t);
                    }}
                    className="text-xs text-terminal-muted"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-semibold">Certificates</h2>
          <div className="mt-4 space-y-3">
            {certificates.map((certificate) => (
              <article key={certificate.id} className="rounded border border-terminal-line p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{certificate.name}</p>
                  <button
                    onClick={() => {
                      setEditingCertificateId(certificate.id);
                      setCertificateInput({
                        name: certificate.name,
                        issuer: certificate.issuer,
                        issue_date: certificate.issue_date ? certificate.issue_date.slice(0, 10) : "",
                        description: certificate.description || "",
                        credential_url: certificate.credential_url || "",
                      });
                    }}
                    className="rounded border border-terminal-line px-2 py-1 text-xs hover:border-terminal-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      const t = requireToken();
                      if (!t) return;
                      await deleteCertificate(t, certificate.id);
                      signalContentUpdated();
                      await refreshData(t);
                    }}
                    className="rounded border border-red-300/40 px-2 py-1 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-1 text-xs text-terminal-muted">{certificate.issuer}</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      const t = requireToken();
                      if (!file || !t) return;
                      await uploadCertificateImage(t, certificate.id, file);
                      signalContentUpdated();
                      await refreshData(t);
                    }}
                    className="text-xs text-terminal-muted"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold">Skills ({skills.length})</h2>
          <div className="mt-3 space-y-2">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between rounded border border-terminal-line px-3 py-2 text-sm">
                <span>{skill.category} :: {skill.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingSkillId(skill.id);
                      setSkillInput({ category: skill.category, name: skill.name, sort_order: skill.sort_order });
                    }}
                    className="rounded border border-terminal-line px-2 py-1 text-xs hover:border-terminal-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      const t = requireToken();
                      if (!t) return;
                      await deleteSkill(t, skill.id);
                      signalContentUpdated();
                      await refreshData(t);
                    }}
                    className="rounded border border-red-300/40 px-2 py-1 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-semibold">Social Links ({socialLinks.length})</h2>
          <div className="mt-3 space-y-2">
            {socialLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between rounded border border-terminal-line px-3 py-2 text-sm">
                <span>{link.platform} ({link.visible ? "visible" : "hidden"})</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingSocialId(link.id);
                      setSocialInput({
                        platform: link.platform,
                        url: link.url,
                        sort_order: link.sort_order,
                        visible: link.visible,
                      });
                    }}
                    className="rounded border border-terminal-line px-2 py-1 text-xs hover:border-terminal-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      const t = requireToken();
                      if (!t) return;
                      await deleteSocialLink(t, link.id);
                      signalContentUpdated();
                      await refreshData(t);
                    }}
                    className="rounded border border-red-300/40 px-2 py-1 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {profile && (
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold">Current Public Profile</h2>
          <pre className="mt-3 overflow-x-auto rounded border border-terminal-line bg-terminal-bg p-4 text-xs text-terminal-muted">{JSON.stringify(profile, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
