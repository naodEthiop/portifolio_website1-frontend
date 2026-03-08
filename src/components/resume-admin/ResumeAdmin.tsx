import { useEffect, useState } from "react";
import {
  fetchResumeData,
  subscribeToResumeChanges,
  type CertificateRow,
  type ExperienceRow,
  type PersonalInfoRow,
  type ProjectRow,
  type SkillRow,
} from "@/lib/supabase/resume";
import { PersonalInfoEditor } from "@/components/resume-admin/editors/PersonalInfoEditor";
import { SkillsEditor } from "@/components/resume-admin/editors/SkillsEditor";
import { ProjectsEditor } from "@/components/resume-admin/editors/ProjectsEditor";
import { ExperienceEditor } from "@/components/resume-admin/editors/ExperienceEditor";
import { CertificatesEditor } from "@/components/resume-admin/editors/CertificatesEditor";

export function ResumeAdmin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [personal, setPersonal] = useState<Partial<PersonalInfoRow> | null>(null);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [experience, setExperience] = useState<ExperienceRow[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);

  const load = async () => {
    try {
      setError("");
      const res = await fetchResumeData();
      setPersonal(
        res.personalInfo || {
          name: "",
          title: "",
          summary: "",
          email: "",
          phone: "",
          linkedin: "",
          github: "",
          portfolio: "",
        },
      );
      setSkills(res.skills);
      setProjects(res.projects);
      setExperience(res.experience);
      setCertificates(res.certificates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resume data.");
    }
  };

  useEffect(() => {
    void load();
    const unsubscribe = subscribeToResumeChanges(() => void load());
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--terminal-warning)]">{error}</div>
      )}

      <PersonalInfoEditor personal={personal} setPersonal={setPersonal} busy={busy} setBusy={setBusy} />
      <SkillsEditor skills={skills} setSkills={setSkills} busy={busy} setBusy={setBusy} />
      <ProjectsEditor projects={projects} setProjects={setProjects} busy={busy} setBusy={setBusy} />
      <ExperienceEditor experience={experience} setExperience={setExperience} busy={busy} setBusy={setBusy} />
      <CertificatesEditor certificates={certificates} setCertificates={setCertificates} busy={busy} setBusy={setBusy} />
    </div>
  );
}

