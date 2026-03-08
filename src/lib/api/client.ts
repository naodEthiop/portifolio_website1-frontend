import axios, { AxiosInstance } from "axios";

const API_V1_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const API_ORIGIN = API_V1_BASE_URL.replace(/\/api\/v1\/?$/, "");

export type ApiEnvelope<T> = { data: T };

export function createV1ApiClient(token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: API_V1_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const resolvedToken = token || (typeof window !== "undefined" ? localStorage.getItem("admin_token") || undefined : undefined);
    if (resolvedToken) {
      config.headers.Authorization = `Bearer ${resolvedToken}`;
    }
    return config;
  });

  return client;
}

export function createOriginApiClient(token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: API_ORIGIN,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const resolvedToken = token || (typeof window !== "undefined" ? localStorage.getItem("admin_token") || undefined : undefined);
    if (resolvedToken) {
      config.headers.Authorization = `Bearer ${resolvedToken}`;
    }
    return config;
  });

  return client;
}

// Backward-compatible alias (admin + legacy v1 APIs).
export const createApiClient = createV1ApiClient;
