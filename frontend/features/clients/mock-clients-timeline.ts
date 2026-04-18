/**
 * Mock clients data for the portfolio timeline preview.
 * Frontend-only until backend endpoints land.
 */

export type ClientStatus = "active" | "at_risk" | "renewal_due" | "expansion_ready" | "dormant";

export type ClientEngagement = {
  id: string;
  projectName: string;
  startWeek: number;
  duration: number;
  bg: string;
  softBg: string;
};

export type PortfolioClient = {
  id: string;
  name: string;
  code: string;
  sector: string;
  manager: string;
  managerId: string;
  status: ClientStatus;
  healthScore: number;
  mrrEur: number;
  renewalInWeeks: number;
  engagements: ClientEngagement[];
  tags: string[];
  logoBg: string;
  logoFg: string;
};

const C = (
  id: string,
  name: string,
  code: string,
  sector: string,
  manager: string,
  managerId: string,
  status: ClientStatus,
  healthScore: number,
  mrrEur: number,
  renewalInWeeks: number,
  engagements: ClientEngagement[],
  tags: string[],
  logoBg: string,
  logoFg: string,
): PortfolioClient => ({
  id, name, code, sector, manager, managerId, status, healthScore, mrrEur, renewalInWeeks,
  engagements, tags, logoBg, logoFg,
});

export const PORTFOLIO_CLIENTS: PortfolioClient[] = [
  C("c-helix", "Helix Bank", "HLX", "Financial services", "Sofia Martin", "m1", "expansion_ready", 88, 42000, 18,
    [
      { id: "orion",   projectName: "Orion core migration", startWeek: 0, duration: 10, bg: "#2f5d50", softBg: "#4a7a6b" },
      { id: "polaris", projectName: "Polaris compliance",   startWeek: 4, duration: 8,  bg: "#3d5a7a", softBg: "#5d7a9a" },
      { id: "nimbus",  projectName: "Nimbus cloud lift",    startWeek: 2, duration: 6,  bg: "#7a3d5a", softBg: "#9a5d7a" },
    ],
    ["banking", "enterprise"], "#2f5d50", "#f4f1ea"),
  C("c-maren", "Maren Labs", "MRN", "Life sciences", "Elena Novak", "m2", "at_risk", 48, 18500, 6,
    [
      { id: "harbor",  projectName: "Harbor API refresh",    startWeek: 1, duration: 6, bg: "#c88a3d", softBg: "#e0a95e" },
      { id: "cascade", projectName: "Cascade data pipeline", startWeek: 2, duration: 4, bg: "#2f5d70", softBg: "#4a7a8a" },
      { id: "lumen",   projectName: "Lumen lighting roadmap", startWeek: 5, duration: 9, bg: "#3d6b7a", softBg: "#5d8a9a" },
    ],
    ["biotech"], "#c88a3d", "#2a1a06"),
  C("c-atlas", "Atlas Retail", "ATL", "Retail", "Jonas Weber", "m3", "active", 82, 24500, 22,
    [
      { id: "vela",   projectName: "Vela analytics suite", startWeek: 2, duration: 9, bg: "#4a6b5d", softBg: "#6b8a7b" },
      { id: "summit", projectName: "Summit KPI dashboards", startWeek: 0, duration: 11, bg: "#3d7a5a", softBg: "#5d9a7a" },
    ],
    ["retail"], "#4a6b5d", "#f4f1ea"),
  C("c-northwind", "Northwind", "NW", "Logistics", "Sofia Martin", "m1", "renewal_due", 71, 19200, 3,
    [
      { id: "meridian", projectName: "Meridian rollout", startWeek: 3, duration: 5, bg: "#5b6b7e", softBg: "#7a8899" },
      { id: "ember",    projectName: "Ember field rollout", startWeek: 1, duration: 7, bg: "#8a5a3d", softBg: "#aa7a5d" },
      { id: "tempo",    projectName: "Tempo payroll",    startWeek: 3, duration: 4, bg: "#5a7a3d", softBg: "#7a9a5d" },
    ],
    ["logistics"], "#5b6b7e", "#f4f1ea"),
  C("c-hsbc", "HSBC UK", "HSBC", "Financial services", "Elena Novak", "m2", "active", 91, 58000, 26,
    [
      { id: "atlas",   projectName: "Atlas GBP billing",   startWeek: 0, duration: 13, bg: "#7a4a3d", softBg: "#9a6a5d" },
      { id: "beacon",  projectName: "Beacon onboarding",  startWeek: 0, duration: 6,  bg: "#5d4a7a", softBg: "#7a6a9a" },
      { id: "orbit",   projectName: "Orbit service desk", startWeek: 1, duration: 8,  bg: "#4a3d7a", softBg: "#6a5d9a" },
    ],
    ["banking", "enterprise", "gbp"], "#7a4a3d", "#f4f1ea"),
  C("c-vitaplex", "Vitaplex", "VTX", "Healthcare", "Jonas Weber", "m3", "renewal_due", 64, 11500, 4,
    [],
    ["healthcare"], "#3d5a5a", "#f4f1ea"),
  C("c-forge", "Forge Industrial", "FRG", "Manufacturing", "Sofia Martin", "m1", "expansion_ready", 79, 22000, 16,
    [],
    ["industrial"], "#6b4a3d", "#f4f1ea"),
  C("c-lumico", "Lumico Energy", "LMC", "Energy", "Elena Novak", "m2", "active", 85, 31000, 30,
    [],
    ["energy"], "#4a5d3d", "#f4f1ea"),
  C("c-riven", "Riven Media", "RVN", "Media", "Jonas Weber", "m3", "dormant", 42, 0, 0,
    [],
    ["media"], "#7a5d4a", "#f4f1ea"),
  C("c-parlay", "Parlay Insurance", "PRL", "Insurance", "Sofia Martin", "m1", "at_risk", 51, 14500, 9,
    [],
    ["insurance"], "#5a3d7a", "#f4f1ea"),
];

export function uniqueSectorsFromClients(): string[] {
  const s = new Set<string>();
  for (const c of PORTFOLIO_CLIENTS) s.add(c.sector);
  return [...s].sort();
}
export function uniqueManagersFromClients(): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const c of PORTFOLIO_CLIENTS) if (!seen.has(c.managerId)) seen.set(c.managerId, c.manager);
  return [...seen].map(([id, name]) => ({ id, name }));
}
export function uniqueTagsFromClients(): string[] {
  const s = new Set<string>();
  for (const c of PORTFOLIO_CLIENTS) for (const tag of c.tags) s.add(tag);
  return [...s].sort();
}
