export type Role = "admin" | "editor";

export interface AuthResponse {
  token: string;
  role: Role;
}

export interface Profile {
  id: string;
  full_name: string;
  handle?: string;
  headline: string;
  location: string;
  summary: string;
  bio: string;
  avatar_url?: string;
  banner_url?: string;
  resume_url?: string;
  cta_primary?: string;
  cta_secondary?: string;
  cta_tertiary?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  status: "complete" | "in_progress" | "archived";
  tech_stack: string[];
  achievements: string[];
  demo_url?: string;
  repo_url?: string;
  image_url?: string;
  featured: boolean;
}

export interface GithubProject {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  homepage?: string;
  description?: string;
  topics: string[];
  language?: string;
  stars: number;
  forks: number;
  archived: boolean;
  updated_at: string;
  pushed_at: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string;
  description?: string;
  credential_url?: string;
  image_url?: string;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  sort_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  sort_order: number;
  visible: boolean;
}

export type ProjectSource = "github" | "manual";

export interface PublicProject {
  id: string;
  source: ProjectSource;
  name: string;
  description?: string;
  tech_stack: string[];
  topics?: string[];
  language?: string;
  stars: number;
  forks: number;
  demo_url?: string;
  repo_url?: string;
  featured: boolean;
  pinned: boolean;
  updated_at: string;
}

export interface PublicProjectsResponse {
  pinned: PublicProject[];
  projects: PublicProject[];
}

export interface ContactResponse {
  profile: Profile;
  social_links: SocialLink[];
}

export interface TeachingItem {
  id: string;
  title: string;
  organization: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  link_url?: string;
  sort_order: number;
  visible: boolean;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  award_date?: string;
  description?: string;
  link_url?: string;
  sort_order: number;
  visible: boolean;
}
