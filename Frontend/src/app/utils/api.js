import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://cosumer-attention-mapping.onrender.com";

export function apiClient() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}