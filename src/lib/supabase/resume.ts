import { getSupabaseClient } from "@/lib/supabase/client";

export type PersonalInfoRow = {
  id: string;
  name: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  created_at: string;
  updated_at: string;
};

export type SkillRow = {
  id: string;
  category: string;
  skill_name: string;
  proficiency: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  tech: string[];
  achievements: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ExperienceRow = {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CertificateRow = {
  id: string;
  name: string;
  issuer: string;
  date: string | null;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ResumeData = {
  personalInfo: PersonalInfoRow | null;
  skills: SkillRow[];
  projects: ProjectRow[];
  experience: ExperienceRow[];
  certificates: CertificateRow[];
};

function assertOk<T>(result: { data: T | null; error: unknown }, label: string): T {
  if (result.error) throw new Error(`${label} failed`);
  if (result.data == null) throw new Error(`${label} returned no data`);
  return result.data;
}

export async function fetchResumeData(): Promise<ResumeData> {
  const supabase = getSupabaseClient();

  const [personalRes, skillsRes, projectsRes, experienceRes, certificatesRes] = await Promise.all([
    supabase.from("personal_info").select("*").order("updated_at", { ascending: false }).limit(1),
    supabase.from("skills").select("*").order("category", { ascending: true }).order("sort_order", { ascending: true }),
    supabase.from("projects").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
    supabase.from("experience").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
    supabase.from("certificates").select("*").order("sort_order", { ascending: true }).order("date", { ascending: false, nullsFirst: false }),
  ]);

  const personal = assertOk(personalRes, "personal_info") as PersonalInfoRow[];
  const skills = assertOk(skillsRes, "skills") as SkillRow[];
  const projects = assertOk(projectsRes, "projects") as ProjectRow[];
  const experience = assertOk(experienceRes, "experience") as ExperienceRow[];
  const certificates = assertOk(certificatesRes, "certificates") as CertificateRow[];

  return {
    personalInfo: personal[0] || null,
    skills,
    projects,
    experience,
    certificates,
  };
}

export function subscribeToResumeChanges(onChange: () => void) {
  const supabase = getSupabaseClient();

  const channel = supabase
    .channel("resume-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "personal_info" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "skills" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "projects" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "experience" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "certificates" },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function upsertPersonalInfo(input: Omit<PersonalInfoRow, "id" | "created_at" | "updated_at"> & { id?: string }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("personal_info")
    .upsert(input, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as PersonalInfoRow;
}

export async function createSkill(input: Omit<SkillRow, "id" | "created_at" | "updated_at">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("skills").insert(input).select("*").single();
  if (error) throw error;
  return data as SkillRow;
}

export async function updateSkill(id: string, patch: Partial<Omit<SkillRow, "id" | "created_at" | "updated_at">>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("skills").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as SkillRow;
}

export async function deleteSkill(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw error;
}

export async function createProject(input: Omit<ProjectRow, "id" | "created_at" | "updated_at">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("projects").insert(input).select("*").single();
  if (error) throw error;
  return data as ProjectRow;
}

export async function updateProject(id: string, patch: Partial<Omit<ProjectRow, "id" | "created_at" | "updated_at">>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as ProjectRow;
}

export async function deleteProject(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function createExperience(input: Omit<ExperienceRow, "id" | "created_at" | "updated_at">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("experience").insert(input).select("*").single();
  if (error) throw error;
  return data as ExperienceRow;
}

export async function updateExperience(id: string, patch: Partial<Omit<ExperienceRow, "id" | "created_at" | "updated_at">>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("experience").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as ExperienceRow;
}

export async function deleteExperience(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) throw error;
}

export async function createCertificate(input: Omit<CertificateRow, "id" | "created_at" | "updated_at">) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("certificates").insert(input).select("*").single();
  if (error) throw error;
  return data as CertificateRow;
}

export async function updateCertificate(id: string, patch: Partial<Omit<CertificateRow, "id" | "created_at" | "updated_at">>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("certificates").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as CertificateRow;
}

export async function deleteCertificate(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("certificates").delete().eq("id", id);
  if (error) throw error;
}

