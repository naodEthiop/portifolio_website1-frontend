import { createApiClient, createOriginApiClient, type ApiEnvelope } from "@/lib/api/client";
import type { AwardItem, Certificate, ContactResponse, Profile, PublicProjectsResponse, Skill, TeachingItem } from "@/lib/api/types";

const v1 = createApiClient();
const origin = createOriginApiClient();

export async function getPublicProfile() {
  const { data } = await v1.get<ApiEnvelope<Profile>>("/profile");
  return data.data;
}

export async function getProjects() {
  const { data } = await origin.get<ApiEnvelope<PublicProjectsResponse>>("/api/projects");
  return data.data;
}

export async function getCertificates() {
  const { data } = await origin.get<ApiEnvelope<Certificate[]>>("/api/certificates");
  return data.data;
}

export async function getSkills() {
  const { data } = await origin.get<ApiEnvelope<Skill[]>>("/api/skills");
  return data.data;
}

export async function getContact() {
  const { data } = await origin.get<ApiEnvelope<ContactResponse>>("/api/contact");
  return data.data;
}

export async function getTeaching() {
  const { data } = await origin.get<ApiEnvelope<TeachingItem[]>>("/api/teaching");
  return data.data;
}

export async function getAwards() {
  const { data } = await origin.get<ApiEnvelope<AwardItem[]>>("/api/awards");
  return data.data;
}
