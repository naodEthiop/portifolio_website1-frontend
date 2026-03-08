export function persistAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_token", token);
  document.cookie = `admin_token=${token}; path=/; max-age=7200; SameSite=Lax`;
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
}

export function readAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}
