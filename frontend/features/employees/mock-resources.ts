/**
 * Mock resources data - frontend preview only.
 * Mirrors the v0 Resources demo dataset so the /employees page has
 * content to render while the backend endpoints are being built.
 */

export type WeekLabel = { date: string; iso: string };

/**
 * Generate contiguous ISO week labels starting from the given date.
 * Used by the Timeline window selector to support 1w / 2w / 1m / 3m /
 * 6m / 9m / 12m / 18m views.
 */
export function generateWeekLabels(count: number, startDate: Date = new Date(2026, 3, 13)): WeekLabel[] {
  const labels: WeekLabel[] = [];
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate.getTime() + i * msPerWeek);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    const isoWeek = Math.floor(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / msPerWeek) + 1);
    labels.push({ date: `${month} ${day}`, iso: `W${isoWeek}` });
  }
  return labels;
}

// Backwards-compat constants (default 8-week window)
export const WEEK_COUNT = 8;
export const TODAY_WEEK_INDEX = 1;
export const WEEK_LABELS: WeekLabel[] = generateWeekLabels(WEEK_COUNT);

export type ProjectId =
  | "orion"
  | "harbor"
  | "vela"
  | "meridian"
  | "atlas"
  | "polaris"
  | "ember"
  | "cascade";

export type Project = {
  id: ProjectId;
  name: string;
  client: string;
  bg: string;
  fg: string;
  softBg: string;
};

export const PROJECTS: Record<ProjectId, Project> = {
  orion:    { id: "orion",    name: "Orion",    client: "Helix Bank",   bg: "#2f5d50", fg: "#f4f1ea", softBg: "#4a7a6b" },
  harbor:   { id: "harbor",   name: "Harbor",   client: "Maren Labs",   bg: "#c88a3d", fg: "#2a1a06", softBg: "#e0a95e" },
  vela:     { id: "vela",     name: "Vela",     client: "Atlas Retail", bg: "#4a6b5d", fg: "#f4f1ea", softBg: "#6b8a7b" },
  meridian: { id: "meridian", name: "Meridian", client: "Northwind",    bg: "#5b6b7e", fg: "#f4f1ea", softBg: "#7a8899" },
  atlas:    { id: "atlas",    name: "Atlas",    client: "HSBC UK",      bg: "#7a4a3d", fg: "#f4f1ea", softBg: "#9a6a5d" },
  polaris:  { id: "polaris",  name: "Polaris",  client: "Helix Bank",   bg: "#3d5a7a", fg: "#f4f1ea", softBg: "#5d7a9a" },
  ember:    { id: "ember",    name: "Ember",    client: "Northwind",    bg: "#8a5a3d", fg: "#f4f1ea", softBg: "#aa7a5d" },
  cascade:  { id: "cascade",  name: "Cascade",  client: "Maren Labs",   bg: "#2f5d70", fg: "#f4f1ea", softBg: "#4a7a8a" },
};

export type AvatarTone = "primary" | "accent" | "gold" | "info";
export type PersonStatus = "active" | "bench" | "on_leave";

export type Person = {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarTone: AvatarTone;
  capacity: number;
  location: string;
  department: string;
  status: PersonStatus;
  skills: string[];
};

export const PEOPLE: Person[] = [
  { id: "alex",     name: "Alex Okafor",      role: "Sr. Engineer",      initials: "AO", avatarTone: "primary", capacity: 40, location: "Lagos",     department: "Engineering", status: "active",   skills: ["TypeScript", "Go", "AWS", "System design"] },
  { id: "maya",     name: "Maya Patel",       role: "Product Designer",  initials: "MP", avatarTone: "accent",  capacity: 40, location: "London",    department: "Design",      status: "active",   skills: ["Figma", "Design systems", "Prototyping"] },
  { id: "jonas",    name: "Jonas Berg",       role: "Engineer",          initials: "JB", avatarTone: "gold",    capacity: 40, location: "Stockholm", department: "Engineering", status: "active",   skills: ["React", "Node", "Postgres"] },
  { id: "sofia",    name: "Sofia Rinaldi",    role: "Product Manager",   initials: "SR", avatarTone: "info",    capacity: 32, location: "Milan",     department: "Product",     status: "active",   skills: ["Discovery", "Roadmapping", "Analytics"] },
  { id: "keiko",    name: "Keiko Tanaka",     role: "Designer",          initials: "KT", avatarTone: "accent",  capacity: 40, location: "Kyoto",     department: "Design",      status: "active",   skills: ["Illustration", "Motion", "Branding"] },
  { id: "marcus",   name: "Marcus Reed",      role: "Data Scientist",    initials: "MR", avatarTone: "gold",    capacity: 40, location: "Toronto",   department: "Data",        status: "active",   skills: ["Python", "SQL", "ML"] },
  { id: "nora",     name: "Nora Haddad",      role: "Sr. Engineer",      initials: "NH", avatarTone: "primary", capacity: 40, location: "Beirut",    department: "Engineering", status: "bench",    skills: ["Rust", "Kubernetes", "Terraform"] },
  { id: "omar",     name: "Omar El-Sayed",    role: "Solution Architect",initials: "OE", avatarTone: "info",    capacity: 40, location: "Cairo",     department: "Engineering", status: "active",   skills: ["GCP", "Event-driven", "Microservices"] },
  { id: "priya",    name: "Priya Raman",      role: "Researcher",        initials: "PR", avatarTone: "accent",  capacity: 32, location: "Bangalore", department: "Design",      status: "bench",    skills: ["User research", "Interviews", "Synthesis"] },
  { id: "devon",    name: "Devon Clarke",     role: "Finance Lead",      initials: "DC", avatarTone: "gold",    capacity: 40, location: "Dublin",    department: "Finance",     status: "active",   skills: ["Modelling", "FP&A", "Pricing"] },
  { id: "lina",     name: "Lina Novak",       role: "Engineer",          initials: "LN", avatarTone: "primary", capacity: 40, location: "Prague",    department: "Engineering", status: "on_leave", skills: ["Vue", "PHP", "MySQL"] },
  { id: "takeshi",  name: "Takeshi Ito",      role: "Sr. Data Scientist",initials: "TI", avatarTone: "gold",    capacity: 40, location: "Osaka",     department: "Data",        status: "active",   skills: ["Python", "Spark", "DBT", "ML"] },
  { id: "amara",    name: "Amara Diallo",     role: "Engineering Manager", initials: "AD", avatarTone: "primary", capacity: 40, location: "Dakar",   department: "Engineering", status: "active",   skills: ["Leadership", "System design", "Hiring"] },
  { id: "felix",    name: "Felix Brandt",     role: "Designer",          initials: "FB", avatarTone: "accent",  capacity: 40, location: "Berlin",    department: "Design",      status: "bench",    skills: ["Figma", "Animation", "UX writing"] },
];

export type Allocation = {
  id: string;
  personId: string;
  projectId: ProjectId;
  startWeek: number;
  duration: number;
  hoursPerWeek: number;
};

export const INITIAL_ALLOCATIONS: Allocation[] = [
  { id: "a1", personId: "alex",    projectId: "orion",    startWeek: 0, duration: 4, hoursPerWeek: 30 },
  { id: "a2", personId: "alex",    projectId: "harbor",   startWeek: 4, duration: 4, hoursPerWeek: 20 },
  { id: "m1", personId: "maya",    projectId: "orion",    startWeek: 0, duration: 5, hoursPerWeek: 24 },
  { id: "m2", personId: "maya",    projectId: "vela",     startWeek: 5, duration: 3, hoursPerWeek: 16 },
  { id: "j1", personId: "jonas",   projectId: "orion",    startWeek: 0, duration: 8, hoursPerWeek: 38 },
  { id: "j2", personId: "jonas",   projectId: "meridian", startWeek: 2, duration: 3, hoursPerWeek: 12 },
  { id: "s1", personId: "sofia",   projectId: "vela",     startWeek: 0, duration: 3, hoursPerWeek: 20 },
  { id: "s2", personId: "sofia",   projectId: "harbor",   startWeek: 4, duration: 4, hoursPerWeek: 12 },
  { id: "k1", personId: "keiko",   projectId: "orion",    startWeek: 0, duration: 2, hoursPerWeek: 14 },
  { id: "r1", personId: "marcus",  projectId: "meridian", startWeek: 0, duration: 6, hoursPerWeek: 28 },
  { id: "r2", personId: "marcus",  projectId: "harbor",   startWeek: 3, duration: 3, hoursPerWeek: 16 },
  { id: "o1", personId: "omar",    projectId: "atlas",    startWeek: 0, duration: 6, hoursPerWeek: 32 },
  { id: "o2", personId: "omar",    projectId: "polaris",  startWeek: 5, duration: 3, hoursPerWeek: 16 },
  { id: "d1", personId: "devon",   projectId: "atlas",    startWeek: 1, duration: 5, hoursPerWeek: 20 },
  { id: "t1", personId: "takeshi", projectId: "cascade",  startWeek: 0, duration: 4, hoursPerWeek: 28 },
  { id: "t2", personId: "takeshi", projectId: "ember",    startWeek: 4, duration: 4, hoursPerWeek: 20 },
  { id: "am1", personId: "amara",  projectId: "polaris",  startWeek: 0, duration: 8, hoursPerWeek: 24 },
];

export function personWorkLoad(personId: string, allocations: Allocation[], weekCount: number = WEEK_COUNT) {
  const person = PEOPLE.find((p) => p.id === personId);
  if (!person) {
    return { perWeek: [] as number[], avgPct: 0, overWeeks: 0, totalHours: 0, person: null };
  }
  const perWeek: number[] = Array(weekCount).fill(0);
  for (const a of allocations) {
    if (a.personId !== personId) continue;
    for (let w = a.startWeek; w < a.startWeek + a.duration && w < weekCount; w++) {
      perWeek[w] = (perWeek[w] ?? 0) + a.hoursPerWeek;
    }
  }
  const totalHours = perWeek.reduce((s, h) => s + h, 0);
  const totalCapacity = person.capacity * weekCount;
  const avgPct = totalCapacity > 0 ? Math.round((totalHours / totalCapacity) * 100) : 0;
  const overWeeks = perWeek.filter((h) => h > person.capacity).length;
  return { perWeek, avgPct, overWeeks, totalHours, person };
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function personStatusLabel(s: PersonStatus): string {
  switch (s) {
    case "active": return "Assigned";
    case "bench": return "On bench";
    case "on_leave": return "On leave";
  }
}

export function allPeopleAllocations(allocations: Allocation[]): Map<string, Allocation[]> {
  const map = new Map<string, Allocation[]>();
  for (const a of allocations) {
    if (!map.has(a.personId)) map.set(a.personId, []);
    map.get(a.personId)!.push(a);
  }
  return map;
}

export function uniqueSkills(): string[] {
  const set = new Set<string>();
  for (const p of PEOPLE) for (const s of p.skills) set.add(s);
  return Array.from(set).sort();
}

export function uniqueDepartments(): string[] {
  return Array.from(new Set(PEOPLE.map((p) => p.department))).sort();
}

export function uniqueClients(): string[] {
  return Array.from(new Set(Object.values(PROJECTS).map((p) => p.client))).sort();
}

export function uniqueProjects(): { id: ProjectId; name: string }[] {
  return Object.values(PROJECTS).map((p) => ({ id: p.id, name: p.name })).sort((a, b) => a.name.localeCompare(b.name));
}
