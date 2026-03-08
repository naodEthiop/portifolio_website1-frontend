import { useEffect, useState } from "react";
import { PortfolioView } from "@/components/public/portfolio-view";
import { getAwards, getCertificates, getContact, getProjects, getSkills, getTeaching } from "@/lib/api/public";
import type { AwardItem, Certificate, ContactResponse, Profile, PublicProjectsResponse, Skill, TeachingItem } from "@/lib/api/types";
import { subscribeToContentUpdates } from "@/lib/content-updates";

const emptyProfile: Profile = {
  id: "local-fallback",
  full_name: "Portfolio Owner",
  handle: "",
  headline: "Profile is being configured",
  location: "Unknown",
  summary: "Admin profile has not been configured yet.",
  bio: "",
  banner_url: "",
  resume_url: "",
  cta_primary: "",
  cta_secondary: "",
  cta_tertiary: "",
};

export function HomePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [projects, setProjects] = useState<PublicProjectsResponse | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [teaching, setTeaching] = useState<TeachingItem[]>([]);
  const [awards, setAwards] = useState<AwardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const [contactRes, projectsRes, certificatesRes, skillsRes, teachingRes, awardsRes] = await Promise.allSettled([
        getContact(),
        getProjects(),
        getCertificates(),
        getSkills(),
        getTeaching(),
        getAwards(),
      ]);

      if (!mounted) return;
      const resolvedContact = contactRes.status === "fulfilled" ? contactRes.value : null;
      setContact(resolvedContact);
      setProfile(resolvedContact?.profile || (contactRes.status === "fulfilled" ? contactRes.value.profile : emptyProfile));
      setProjects(projectsRes.status === "fulfilled" ? projectsRes.value : null);
      setCertificates(certificatesRes.status === "fulfilled" ? certificatesRes.value : []);
      setSkills(skillsRes.status === "fulfilled" ? skillsRes.value : []);
      setTeaching(teachingRes.status === "fulfilled" ? teachingRes.value : []);
      setAwards(awardsRes.status === "fulfilled" ? awardsRes.value : []);
      setLoading(false);
    };

    load();
    const unsubscribe = subscribeToContentUpdates(load);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <PortfolioView
      profile={profile}
      contact={contact}
      projects={projects}
      certificates={certificates}
      skills={skills}
      teaching={teaching}
      awards={awards}
      loading={loading}
    />
  );
}
