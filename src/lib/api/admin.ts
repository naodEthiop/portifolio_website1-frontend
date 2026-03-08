import { createApiClient, type ApiEnvelope } from "@/lib/api/client";
import type { AuthResponse, AwardItem, Certificate, Profile, Project, Skill, SocialLink, TeachingItem } from "@/lib/api/types";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const api = createApiClient();
  const { data } = await api.post<ApiEnvelope<AuthResponse>>("/auth/login", { email, password });
  return data.data;
}

export async function listAdminProjects(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get<ApiEnvelope<Project[]>>("/admin/projects");
  return data.data;
}

export async function createProject(token: string, payload: Partial<Project>) {
  const api = createApiClient(token);
  const { data } = await api.post<ApiEnvelope<Project>>("/admin/projects", payload);
  return data.data;
}

export async function updateProject(token: string, id: string, payload: Partial<Project>) {
  const api = createApiClient(token);
  const { data } = await api.put<ApiEnvelope<Project>>(`/admin/projects/${id}`, payload);
  return data.data;
}

export async function deleteProject(token: string, id: string) {
  const api = createApiClient(token);
  await api.delete(`/admin/projects/${id}`);
}

export async function toggleFeatured(token: string, id: string, featured: boolean) {
  const api = createApiClient(token);
  const { data } = await api.patch<ApiEnvelope<Project>>(`/admin/projects/${id}/featured`, { featured });
  return data.data;
}

export async function uploadProjectImage(token: string, id: string, file: File) {
  const api = createApiClient(token);
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<ApiEnvelope<Project>>(`/admin/projects/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function createCertificate(token: string, payload: Partial<Certificate>) {
  const api = createApiClient(token);
  const { data } = await api.post<ApiEnvelope<Certificate>>("/admin/certificates", payload);
  return data.data;
}

export async function updateCertificate(token: string, id: string, payload: Partial<Certificate>) {
  const api = createApiClient(token);
  const { data } = await api.put<ApiEnvelope<Certificate>>(`/admin/certificates/${id}`, payload);
  return data.data;
}

export async function deleteCertificate(token: string, id: string) {
  const api = createApiClient(token);
  await api.delete(`/admin/certificates/${id}`);
}

export async function uploadCertificateImage(token: string, id: string, file: File) {
  const api = createApiClient(token);
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<ApiEnvelope<Certificate>>(`/admin/certificates/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function upsertProfile(token: string, payload: Partial<Profile>) {
  const api = createApiClient(token);
  const { data } = await api.put<ApiEnvelope<Profile>>("/admin/profile", payload);
  return data.data;
}

export async function createSkill(token: string, payload: Partial<Skill>) {
  const api = createApiClient(token);
  const { data } = await api.post<ApiEnvelope<Skill>>("/admin/skills", payload);
  return data.data;
}

export async function updateSkill(token: string, id: string, payload: Partial<Skill>) {
  const api = createApiClient(token);
  const { data } = await api.put<ApiEnvelope<Skill>>(`/admin/skills/${id}`, payload);
  return data.data;
}

export async function deleteSkill(token: string, id: string) {
  const api = createApiClient(token);
  await api.delete(`/admin/skills/${id}`);
}

export async function listAdminSocialLinks(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get<ApiEnvelope<SocialLink[]>>("/admin/social-links");
  return data.data;
}

export async function createSocialLink(token: string, payload: Partial<SocialLink>) {
  const api = createApiClient(token);
  const { data } = await api.post<ApiEnvelope<SocialLink>>("/admin/social-links", payload);
  return data.data;
}

export async function updateSocialLink(token: string, id: string, payload: Partial<SocialLink>) {
  const api = createApiClient(token);
  const { data } = await api.put<ApiEnvelope<SocialLink>>(`/admin/social-links/${id}`, payload);
  return data.data;
}

export async function deleteSocialLink(token: string, id: string) {
  const api = createApiClient(token);
  await api.delete(`/admin/social-links/${id}`);
}

export async function listAdminTeaching(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get<ApiEnvelope<TeachingItem[]>>("/admin/teaching");
  return data.data;
}

export async function createTeaching(token: string, payload: Partial<TeachingItem>) {
  const api = createApiClient(token);
  const { data } = await api.post<ApiEnvelope<TeachingItem>>("/admin/teaching", payload);
  return data.data;
}

export async function updateTeaching(token: string, id: string, payload: Partial<TeachingItem>) {
  const api = createApiClient(token);
  const { data } = await api.put<ApiEnvelope<TeachingItem>>(`/admin/teaching/${id}`, payload);
  return data.data;
}

export async function deleteTeaching(token: string, id: string) {
  const api = createApiClient(token);
  await api.delete(`/admin/teaching/${id}`);
}

export async function listAdminAwards(token: string) {
  const api = createApiClient(token);
  const { data } = await api.get<ApiEnvelope<AwardItem[]>>("/admin/awards");
  return data.data;
}

export async function createAward(token: string, payload: Partial<AwardItem>) {
  const api = createApiClient(token);
  const { data } = await api.post<ApiEnvelope<AwardItem>>("/admin/awards", payload);
  return data.data;
}

export async function updateAward(token: string, id: string, payload: Partial<AwardItem>) {
  const api = createApiClient(token);
  const { data } = await api.put<ApiEnvelope<AwardItem>>(`/admin/awards/${id}`, payload);
  return data.data;
}

export async function deleteAward(token: string, id: string) {
  const api = createApiClient(token);
  await api.delete(`/admin/awards/${id}`);
}
