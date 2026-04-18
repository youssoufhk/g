/**
 * Mock projects data for the portfolio timeline preview.
 * Frontend-only until backend endpoints land.
 */

export type ProjectPhase = "discovery" | "delivery" | "review" | "at_risk" | "on_hold";

export type ProjectStatus = "active" | "at_risk" | "ending_soon" | "unstaffed" | "on_hold";

export type TeamMemberRef = { id: string; initials: string; tone: "primary" | "accent" | "gold" | "info" };

export type PortfolioProject = {
  id: string;
  name: string;
  code: string;
  client: string;
  clientId: string;
  manager: string;
  managerId: string;
  phase: ProjectPhase;
  startWeek: number;
  duration: number;
  progressPct: number;
  budgetPct: number;
  teamSize: number;
  team: TeamMemberRef[];
  tags: string[];
  status: ProjectStatus;
  healthScore: number;
  bg: string;
  fg: string;
  softBg: string;
};

const P = (
  id: string,
  name: string,
  code: string,
  client: string,
  clientId: string,
  manager: string,
  managerId: string,
  phase: ProjectPhase,
  startWeek: number,
  duration: number,
  progressPct: number,
  budgetPct: number,
  team: TeamMemberRef[],
  tags: string[],
  status: ProjectStatus,
  healthScore: number,
  bg: string,
  softBg: string,
): PortfolioProject => ({
  id, name, code, client, clientId, manager, managerId, phase, startWeek, duration,
  progressPct, budgetPct, teamSize: team.length, team, tags, status, healthScore,
  bg, fg: "#f4f1ea", softBg,
});

const TEAM = {
  js: { id: "p1", initials: "JS", tone: "primary" as const },
  mh: { id: "p2", initials: "MH", tone: "accent" as const },
  lk: { id: "p3", initials: "LK", tone: "gold" as const },
  pn: { id: "p4", initials: "PN", tone: "info" as const },
  aa: { id: "p5", initials: "AA", tone: "primary" as const },
  rd: { id: "p6", initials: "RD", tone: "accent" as const },
};

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  P("orion",    "Orion core migration",   "ORN-042", "Helix Bank",   "c-helix",    "Sofia Martin", "m1", "delivery",  0,  10, 62, 58, [TEAM.js, TEAM.mh, TEAM.lk],        ["banking","platform"],    "active",      82, "#2f5d50", "#4a7a6b"),
  P("harbor",   "Harbor API refresh",     "HBR-017", "Maren Labs",   "c-maren",    "Elena Novak",  "m2", "at_risk",   1,  6,  34, 92, [TEAM.pn, TEAM.aa],                 ["api","integration"],     "at_risk",     41, "#c88a3d", "#e0a95e"),
  P("vela",     "Vela analytics suite",   "VEL-008", "Atlas Retail", "c-atlas",    "Jonas Weber",  "m3", "delivery",  2,  9,  48, 44, [TEAM.mh, TEAM.rd, TEAM.js],        ["analytics"],             "active",      88, "#4a6b5d", "#6b8a7b"),
  P("meridian", "Meridian rollout",       "MRD-003", "Northwind",    "c-northwind","Sofia Martin", "m1", "review",    3,  5,  88, 71, [TEAM.lk, TEAM.aa],                 ["rollout"],               "ending_soon", 77, "#5b6b7e", "#7a8899"),
  P("atlas",    "Atlas GBP billing",      "ATL-021", "HSBC UK",      "c-hsbc",     "Elena Novak",  "m2", "delivery",  0,  13, 21, 18, [TEAM.js, TEAM.mh, TEAM.pn, TEAM.rd],["billing","gbp"],         "active",      91, "#7a4a3d", "#9a6a5d"),
  P("polaris",  "Polaris compliance",     "POL-014", "Helix Bank",   "c-helix",    "Jonas Weber",  "m3", "discovery", 4,  8,  10, 6,  [TEAM.aa],                           ["compliance"],            "unstaffed",   62, "#3d5a7a", "#5d7a9a"),
  P("ember",    "Ember field rollout",    "EMB-005", "Northwind",    "c-northwind","Sofia Martin", "m1", "delivery",  1,  7,  55, 48, [TEAM.rd, TEAM.pn],                 ["rollout","field"],       "active",      74, "#8a5a3d", "#aa7a5d"),
  P("cascade",  "Cascade data pipeline",  "CSC-011", "Maren Labs",   "c-maren",    "Elena Novak",  "m2", "review",    2,  4,  93, 66, [TEAM.lk, TEAM.js],                 ["data"],                  "ending_soon", 84, "#2f5d70", "#4a7a8a"),
  P("beacon",   "Beacon onboarding",      "BCN-019", "HSBC UK",      "c-hsbc",     "Sofia Martin", "m1", "on_hold",   0,  6,  12, 8,  [TEAM.mh],                           ["onboarding"],            "on_hold",     55, "#5d4a7a", "#7a6a9a"),
  P("summit",   "Summit KPI dashboards",  "SMT-027", "Atlas Retail", "c-atlas",    "Jonas Weber",  "m3", "delivery",  0,  11, 40, 36, [TEAM.aa, TEAM.rd, TEAM.pn],        ["dashboard"],             "active",      79, "#3d7a5a", "#5d9a7a"),
  P("nimbus",   "Nimbus cloud lift",      "NMB-013", "Helix Bank",   "c-helix",    "Elena Novak",  "m2", "at_risk",   2,  6,  27, 88, [TEAM.js, TEAM.lk],                 ["cloud","infra"],         "at_risk",     38, "#7a3d5a", "#9a5d7a"),
  P("tempo",    "Tempo payroll",          "TMP-009", "Northwind",    "c-northwind","Jonas Weber",  "m3", "review",    3,  4,  82, 54, [TEAM.rd],                           ["payroll"],               "ending_soon", 81, "#5a7a3d", "#7a9a5d"),
  P("lumen",    "Lumen lighting roadmap", "LMN-031", "Maren Labs",   "c-maren",    "Sofia Martin", "m1", "discovery", 5,  9,  5,  3,  [TEAM.mh, TEAM.pn],                 ["roadmap"],               "unstaffed",   66, "#3d6b7a", "#5d8a9a"),
  P("orbit",    "Orbit service desk",     "ORB-025", "HSBC UK",      "c-hsbc",     "Elena Novak",  "m2", "delivery",  1,  8,  44, 39, [TEAM.aa, TEAM.js, TEAM.mh],        ["service-desk"],          "active",      85, "#4a3d7a", "#6a5d9a"),
];

export function uniqueClientsFromPortfolio(): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const p of PORTFOLIO_PROJECTS) if (!seen.has(p.clientId)) seen.set(p.clientId, p.client);
  return [...seen].map(([id, name]) => ({ id, name }));
}

export function uniqueManagersFromPortfolio(): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const p of PORTFOLIO_PROJECTS) if (!seen.has(p.managerId)) seen.set(p.managerId, p.manager);
  return [...seen].map(([id, name]) => ({ id, name }));
}

export function uniqueTagsFromPortfolio(): string[] {
  const s = new Set<string>();
  for (const p of PORTFOLIO_PROJECTS) for (const t of p.tags) s.add(t);
  return [...s].sort();
}
