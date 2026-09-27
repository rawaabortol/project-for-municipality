import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./APIConst";
import { authStorage } from "./authStorage";

/** Fired when the server rejects our token, so AuthContext can drop the session. */
export const SESSION_EXPIRED_EVENT = "tripoli:session-expired";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.startsWith("/auth/");
    if (status === 401 && !isAuthCall && authStorage.getToken()) {
      authStorage.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    // Surface the server's message so components can show it directly
    const message =
      error.response?.data?.message ||
      (error.response ? `Request failed (${status})` : "Cannot reach the server. Is the API running?");
    return Promise.reject(Object.assign(new Error(message), { status }));
  },
);

export default apiClient;
