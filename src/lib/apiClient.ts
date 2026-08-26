export type PublicUser = { id: string; name: string; email: string };

export type Raag = { id: string; name: string };

export type RiyazType = "ALANKAR" | "AALAP" | "JOD" | "TAAL_VISTAR" | "SONGS";

export const RIYAZ_TYPES: { value: RiyazType; label: string }[] = [
  { value: "ALANKAR", label: "Alankar" },
  { value: "AALAP", label: "Aalap" },
  { value: "JOD", label: "Jod" },
  { value: "TAAL_VISTAR", label: "Taal vistar" },
  { value: "SONGS", label: "Songs" },
];

export type RiyazSession = {
  id: string;
  practiceDate: string;
  durationMinutes: number | null;
  types: RiyazType[];
  raag: { id: string; name: string };
};

export type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
};

export type CalendarDay = {
  date: string;
  practiced: boolean;
  sessionCount: number;
  totalMinutes: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request to ${path} failed with ${res.status}`);
  }
  return data as T;
}

export function signup(input: { name: string; email: string; password: string }) {
  return request<{ token: string; user: PublicUser }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return request<{ token: string; user: PublicUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return request<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function getMe() {
  return request<{ user: PublicUser }>("/api/auth/me");
}

export function searchRaags(search: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<{ raags: Raag[] }>(`/api/raags${params}`);
}

export function createSession(input: {
  raagName: string;
  practiceDate?: string;
  durationMinutes?: number;
  types?: RiyazType[];
}) {
  return request<{ session: RiyazSession }>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listSessions(params: { page?: number; pageSize?: number } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return request<{ sessions: RiyazSession[]; total: number; page: number; pageSize: number }>(
    `/api/sessions${qs ? `?${qs}` : ""}`,
  );
}

export function deleteSession(id: string) {
  return request<{ ok: true }>(`/api/sessions/${id}`, { method: "DELETE" });
}

export function getStreak() {
  return request<StreakResult>("/api/streaks/me");
}

export function getCalendar() {
  return request<{ from: string; to: string; days: CalendarDay[] }>("/api/calendar");
}
