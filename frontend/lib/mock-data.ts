/**
 * Centralized mock data for the Gamma frontend.
 * Matches the canonical seed data spec in specs/DATA_ARCHITECTURE.md section 12.10.
 *
 * Generated deterministically - no random values. Safe to import in any context.
 */

import type { Employee } from "@/features/employees/types";
import type { Client } from "@/features/clients/types";
import type { Project, ProjectPhase, ProjectStatus } from "@/features/projects/types";
import type { DashboardKpis } from "@/features/dashboard/types";
import type { Invoice, InvoiceStatus } from "@/features/invoices/types";
import type { Expense, ExpenseCategory, ExpenseStatus } from "@/features/expenses/types";
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/features/leaves/types";

// ── Name pools ────────────────────────────────────────────────────────────────

const MALE_FIRST = [
  "Alexandre", "Thomas", "Nicolas", "Pierre", "Jean-Baptiste",
  "Mehdi", "Karim", "Antoine", "Lucas", "Hugo",
  "Julien", "Maxime", "Romain", "Adrien", "Baptiste",
  "Youssouf", "Hamza", "Samir", "Kevin", "Francois",
  "Philippe", "Laurent", "Eric", "Michel", "David",
  "Sebastien", "Christophe", "Patrick", "Bernard", "Daniel",
];

const FEMALE_FIRST = [
  "Sophie", "Marie", "Camille", "Julie", "Chloe",
  "Emma", "Lea", "Laura", "Charlotte", "Marine",
  "Alice", "Amelie", "Claire", "Sarah", "Lucie",
  "Emilie", "Manon", "Elise", "Helene", "Aurelie",
  "Nathalie", "Isabelle", "Valerie", "Sandrine", "Catherine",
  "Anne", "Stephanie", "Veronique", "Patricia", "Dominique",
];

const LAST_NAMES = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert",
  "Richard", "Petit", "Durand", "Leroy", "Moreau",
  "Simon", "Laurent", "Lefebvre", "Michel", "Garcia",
  "David", "Bertrand", "Roux", "Vincent", "Fournier",
  "Morel", "Girard", "Andre", "Lefevre", "Mercier",
  "Dupont", "Lambert", "Bonnet", "Francois", "Martinez",
  "Benali", "Kerzika", "Hamidi", "Bouchard", "Gauthier",
  "Henry", "Rousseau", "Blanc", "Guerin", "Faure",
];

function firstName(i: number): string {
  const isMale = i % 2 === 0;
  const pool = isMale ? MALE_FIRST : FEMALE_FIRST;
  return pool[i % pool.length] ?? pool[0] ?? "Jean";
}

function lastName(i: number): string {
  return LAST_NAMES[i % LAST_NAMES.length] ?? "Martin";
}

function fullName(i: number): string {
  return `${firstName(i)} ${lastName(i)}`;
}

function email(name: string, domain = "globalg.consulting"): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".");
  return `${slug}@${domain}`;
}

// ── Teams (12) ────────────────────────────────────────────────────────────────

export type Team = {
  id: string;
  name: string;
  practice: string;
};

export const TEAMS: Team[] = [
  { id: "t1",  name: "Finance Advisory",      practice: "Finance" },
  { id: "t2",  name: "Technology",            practice: "Technology" },
  { id: "t3",  name: "Strategy",              practice: "Strategy" },
  { id: "t4",  name: "Risk & Compliance",     practice: "Risk" },
  { id: "t5",  name: "Digital Transformation",practice: "Digital" },
  { id: "t6",  name: "Operations",            practice: "Operations" },
  { id: "t7",  name: "HR & Change",           practice: "HR" },
  { id: "t8",  name: "Data & Analytics",      practice: "Data" },
  { id: "t9",  name: "ESG & Sustainability",  practice: "ESG" },
  { id: "t10", name: "M&A Advisory",          practice: "M&A" },
  { id: "t11", name: "PMO",                   practice: "PMO" },
  { id: "t12", name: "Infrastructure",        practice: "Infrastructure" },
];

// ── Employees (201 total) ─────────────────────────────────────────────────────
//
// Distribution:
//   1  owner   - Youssouf Kerzika (id: "e1")
//   2  admin   - COO + Systems admin
//   4  finance - CFO, Finance director, Accountant, Billing specialist
//   15 manager - 2 Delivery directors + 5 Senior PMs + 8 PMs
//   177 employee - consultants + HR + ops
//   2  readonly - Auditor + Intern

const MANAGER_TITLES = [
  "Delivery Director", "Delivery Director",
  "Senior Project Manager", "Senior Project Manager", "Senior Project Manager", "Senior Project Manager", "Senior Project Manager",
  "Project Manager", "Project Manager", "Project Manager", "Project Manager",
  "Project Manager", "Project Manager", "Project Manager", "Project Manager",
];

const FINANCE_TITLES = [
  "CFO",
  "Finance Director",
  "Senior Accountant",
  "Billing Specialist",
];

const EMPLOYEE_TITLES = [
  ...Array(3).fill("HR Manager"),
  ...Array(2).fill("Talent Acquisition Specialist"),
  ...Array(25).fill("Senior Consultant"),
  ...Array(80).fill("Consultant"),
  ...Array(60).fill("Junior Consultant"),
  ...Array(7).fill("Operations Specialist"),
];

const EMPLOYEE_DEPARTMENTS = ["Strategy", "Operations", "Finance", "Technology", "HR"];

function buildEmployees(): Employee[] {
  const list: Employee[] = [];
  let idx = 0;

  // 1 - Owner
  list.push({
    id: "e1",
    name: "Youssouf Kerzika",
    title: "Founding Director",
    department: "Strategy",
    email: "youssouf.kerzika@globalg.consulting",
    status: "active",
    start_date: "2020-01-01",
    work_time_pct: 100,
    avatar_color_index: 0,
    location: "London",
    manager_id: undefined,
    manager_name: undefined,
  });
  idx++;

  // 2 - Admins
  const adminTitles = ["Chief Operating Officer", "Systems Administrator"];
  for (let i = 0; i < 2; i++) {
    const name = fullName(idx + i * 7);
    list.push({
      id: `e${idx + 1}`,
      name,
      title: adminTitles[i] ?? "Administrator",
      department: "Operations",
      email: email(name),
      status: "active",
      start_date: `2020-0${i + 2}-01`,
      work_time_pct: 90 + i * 3,
      avatar_color_index: (idx + i) % 8,
      location: i === 0 ? "London" : "Paris",
      manager_id: "e1",
      manager_name: "Youssouf Kerzika",
    });
    idx++;
  }

  // 4 - Finance
  for (let i = 0; i < 4; i++) {
    const name = fullName(idx + i * 11);
    list.push({
      id: `e${idx + 1}`,
      name,
      title: FINANCE_TITLES[i] ?? "Finance Specialist",
      department: "Finance",
      email: email(name),
      status: "active",
      start_date: `2020-${String(i + 3).padStart(2, "0")}-01`,
      work_time_pct: 85 + i * 2,
      avatar_color_index: (idx + i) % 8,
      location: "Paris",
      manager_id: "e1",
      manager_name: "Youssouf Kerzika",
    });
    idx++;
  }

  // 15 - Managers
  for (let i = 0; i < 15; i++) {
    const name = fullName(idx + i * 3);
    list.push({
      id: `e${idx + 1}`,
      name,
      title: MANAGER_TITLES[i] ?? "Project Manager",
      department: EMPLOYEE_DEPARTMENTS[i % EMPLOYEE_DEPARTMENTS.length] ?? "Operations",
      email: email(name),
      status: i === 5 ? "on_leave" : "active",
      start_date: `2019-${String((i % 12) + 1).padStart(2, "0")}-01`,
      work_time_pct: i === 5 ? 0 : 75 + (i % 20),
      avatar_color_index: (idx + i) % 8,
      location: i % 3 === 0 ? "London" : "Paris",
      manager_id: i < 7 ? "e1" : `e${8 + (i % 3)}`,
      manager_name: i < 7 ? "Youssouf Kerzika" : fullName((8 + (i % 3)) * 3),
    });
    idx++;
  }

  // 177 - Employees
  for (let i = 0; i < 177; i++) {
    const titleIdx = i % EMPLOYEE_TITLES.length;
    const name = fullName(idx + i * 2);
    const isOnLeave = i % 29 === 0;
    const isInactive = i % 47 === 0;
    const status: Employee["status"] = isInactive
      ? "inactive"
      : isOnLeave
        ? "on_leave"
        : "active";

    // Assign a manager from the manager pool (ids e8 to e22)
    const managerId = `e${8 + (i % 15)}`;
    const managerRef = list.find((e) => e.id === managerId);

    list.push({
      id: `e${idx + 1}`,
      name,
      title: EMPLOYEE_TITLES[titleIdx] ?? "Consultant",
      department: EMPLOYEE_DEPARTMENTS[i % EMPLOYEE_DEPARTMENTS.length] ?? "Operations",
      email: email(name),
      status,
      start_date: `${2018 + (i % 7)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
      work_time_pct: isInactive ? 0 : isOnLeave ? 0 : 40 + (i % 55),
      avatar_color_index: (idx + i) % 8,
      location: i % 4 === 0 ? "London" : i % 4 === 1 ? "Bordeaux" : i % 4 === 2 ? "Lyon" : "Paris",
      manager_id: managerId,
      manager_name: managerRef?.name,
    });
    idx++;
  }

  // 2 - Readonly
  const readonlyTitles = ["External Auditor", "Intern"];
  for (let i = 0; i < 2; i++) {
    const name = fullName(idx + i * 17);
    list.push({
      id: `e${idx + 1}`,
      name,
      title: readonlyTitles[i] ?? "Intern",
      department: i === 0 ? "Finance" : "Operations",
      email: email(name),
      status: "active",
      start_date: `2025-0${i + 1}-15`,
      work_time_pct: i === 0 ? 20 : 50,
      avatar_color_index: (idx + i) % 8,
      location: "Paris",
      manager_id: "e4",
      manager_name: list.find((e) => e.id === "e4")?.name,
    });
    idx++;
  }

  return list;
}

export const EMPLOYEES: Employee[] = buildEmployees();

// ── Clients (120 total) ───────────────────────────────────────────────────────

const LARGE_CLIENT_NAMES = [
  "HSBC UK", "BNP Paribas", "TotalEnergies", "Renault Group", "L Oreal",
  "AXA Group", "Societe Generale", "Credit Agricole", "Capgemini", "Thales",
  "Orange SA", "Safran", "Airbus Group", "Engie", "Vivendi",
  "Peugeot Citroen", "Michelin", "Air France KLM", "Carrefour", "Danone",
  "LVMH", "Hermes International", "Kering", "Publicis", "Sodexo",
  "Legrand", "Schneider Electric", "Saint Gobain", "Veolia Environment", "Bouygues",
];

const MID_CLIENT_NAMES = [
  "McKinsey & Company", "Roland Berger", "Oliver Wyman", "Sia Partners", "Mazars",
  "Accuracy", "Eight Advisory", "Veltys", "Ailancy", "Eurogroup Consulting",
  "Advancy", "Kea & Partners", "Solucom", "Wavestone", "Synpulse",
  "Vertuo Conseil", "Ineum Consulting", "Devoteam", "Sopra Consulting", "Openvaluation",
  "Kurt Salmon", "Seenago", "Asterion Industrial Partners", "CBX Advisory", "Stanwell Consulting",
  "Valantis", "Archetype", "Lansdowne Partners", "Ares Management", "Sagard Holdings",
  "Clarity Consulting", "Altair Advisory", "Beacon Partners", "Cygnus Solutions", "Delta Advisory",
  "Envision Consulting", "Fortis Partners", "Granite Advisory", "Horizon Solutions", "Impetus Consulting",
  "Junction Advisory", "Kinetic Partners", "Landmark Consulting", "Meridian Advisory", "Nova Partners",
  "Opus Advisory", "Pinnacle Consulting", "Quantum Solutions", "Ridge Partners", "Summit Advisory",
];

const SMALL_CLIENT_NAMES = [
  "Lyon Digital", "Paris Strategy", "Bordeaux Finance", "Nice Advisory", "Toulouse Tech",
  "Nantes Consulting", "Strasbourg Solutions", "Lille Partners", "Rennes Advisory", "Grenoble Digital",
  "Montpellier Consulting", "Marseille Finance", "Dijon Strategy", "Reims Advisory", "Le Havre Partners",
  "Amiens Consulting", "Clermont Finance", "Limoges Digital", "Tours Strategy", "Metz Advisory",
  "Caen Solutions", "Nancy Partners", "Perpignan Finance", "Angers Digital", "Rouen Strategy",
  "Besancon Advisory", "Poitiers Consulting", "Nimes Solutions", "Aix Partners", "Brest Finance",
  "Toulon Digital", "Pau Strategy", "Bayonne Advisory", "Angouleme Consulting", "Niort Solutions",
  "Annecy Partners", "Chambery Finance", "Valence Digital", "Brive Strategy", "Perigueux Advisory",
];

const INDUSTRIES = [
  "Financial Services", "Energy", "Automotive", "Consulting", "Technology",
  "Retail", "Healthcare", "Aerospace", "Telecoms", "Manufacturing",
  "Media", "FMCG", "Real Estate", "Transport", "Utilities",
];

const COUNTRIES_EUR = [
  "France", "Germany", "Spain", "Italy", "Netherlands",
  "Belgium", "Switzerland", "Luxembourg", "Sweden", "Denmark",
];

function buildClients(): Client[] {
  const list: Client[] = [];

  // 30 large clients - first is always HSBC UK (GBP), rest EUR
  for (let i = 0; i < 30; i++) {
    const isHSBC = i === 0;
    const name = LARGE_CLIENT_NAMES[i] ?? `Large Client ${i + 1}`;
    const totalProjects = 5 + (i % 8);
    const activeProjects = 2 + (i % 4);
    const revenueBase = 300000 + i * 40000;

    list.push({
      id: `c${i + 1}`,
      name,
      industry: isHSBC ? "Financial Services" : (INDUSTRIES[i % INDUSTRIES.length] ?? "Consulting"),
      country: isHSBC ? "United Kingdom" : (COUNTRIES_EUR[i % COUNTRIES_EUR.length] ?? "France"),
      currency: isHSBC ? "GBP" : "EUR",
      status: i < 25 ? "active" : "inactive",
      active_projects: i >= 25 ? 0 : activeProjects,
      total_projects: totalProjects,
      revenue_ytd: i >= 25 ? 0 : revenueBase,
      revenue_prev_year: Math.round(revenueBase * (0.85 + (i % 20) / 100)),
      team_size: 4 + (i % 6),
      logo_color_index: i % 8,
      since_date: `${2018 + (i % 5)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
      billing_contact: `Contact ${i + 1}`,
    });
  }

  // 50 mid clients - all EUR
  for (let i = 0; i < 50; i++) {
    const cid = 30 + i + 1;
    const nameBase = MID_CLIENT_NAMES[i % MID_CLIENT_NAMES.length] ?? `Mid Client ${i + 1}`;
    const suffix = i >= MID_CLIENT_NAMES.length ? ` ${Math.floor(i / MID_CLIENT_NAMES.length) + 1}` : "";
    const totalProjects = 2 + (i % 2);
    const activeProjects = i % 3 === 0 ? 0 : 1 + (i % 2);
    const revenueBase = 80000 + i * 12000;

    list.push({
      id: `c${cid}`,
      name: nameBase + suffix,
      industry: INDUSTRIES[(i + 5) % INDUSTRIES.length] ?? "Consulting",
      country: COUNTRIES_EUR[(i + 2) % COUNTRIES_EUR.length] ?? "France",
      currency: "EUR",
      status: i < 40 ? "active" : "prospect",
      active_projects: i >= 40 ? 0 : activeProjects,
      total_projects: totalProjects,
      revenue_ytd: i >= 40 ? 0 : revenueBase,
      revenue_prev_year: Math.round(revenueBase * (0.82 + (i % 25) / 100)),
      team_size: 1 + (i % 4),
      logo_color_index: (i + 2) % 8,
      since_date: `${2019 + (i % 5)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
    });
  }

  // 40 small clients - all EUR, 1 project each
  for (let i = 0; i < 40; i++) {
    const cid = 80 + i + 1;
    const name = SMALL_CLIENT_NAMES[i % SMALL_CLIENT_NAMES.length] ?? `Small Client ${i + 1}`;
    const revenueBase = 20000 + i * 3000;

    list.push({
      id: `c${cid}`,
      name,
      industry: INDUSTRIES[(i + 3) % INDUSTRIES.length] ?? "Consulting",
      country: COUNTRIES_EUR[(i + 4) % COUNTRIES_EUR.length] ?? "France",
      currency: "EUR",
      status: i < 28 ? "active" : "prospect",
      active_projects: i >= 28 ? 0 : 1,
      total_projects: 1,
      revenue_ytd: i >= 28 ? 0 : revenueBase,
      revenue_prev_year: Math.round(revenueBase * (0.78 + (i % 30) / 100)),
      team_size: 1 + (i % 2),
      logo_color_index: (i + 4) % 8,
      since_date: `${2021 + (i % 4)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
    });
  }

  return list;
}

export const CLIENTS: Client[] = buildClients();

// ── Projects (260 total) ──────────────────────────────────────────────────────

const DOMAINS = [
  "Digital", "Risk", "ESG", "Lean", "PMO",
  "Finance", "Strategy", "Data", "Ops", "Tech",
  "HR", "Compliance", "Transformation", "Analytics", "Platform",
];

function clientShortName(name: string): string {
  // Take up to 2 words, drop common legal suffixes
  return name
    .replace(/ (Group|SA|UK|& Company|& Partners|& Co|Holdings|Management|Advisory|Consulting|Solutions|Partners)$/i, "")
    .split(" ")
    .slice(0, 2)
    .join(" ");
}

function buildProjects(): Project[] {
  const list: Project[] = [];

  // Managers pool: employees e8 to e22 (indices 7-21 in EMPLOYEES array)
  const managerPool = EMPLOYEES.slice(7, 22);

  let pIdx = 0;

  // 160 active projects - distributed across the first 100 clients
  for (let i = 0; i < 160; i++) {
    const client = CLIENTS[i % 100] ?? CLIENTS[0]!;
    const domain = DOMAINS[i % DOMAINS.length] ?? "Digital";
    const year = 2025 + (i % 2);
    const mgr = managerPool[i % managerPool.length] ?? managerPool[0]!;
    const budgetBase = 80000 + i * 15000;
    const consumedPct = 10 + (i % 80);

    // Vary phases for active projects
    const phase: ProjectPhase = i % 7 === 0
      ? "at_risk"
      : i % 11 === 0
        ? "on_hold"
        : i % 5 === 0
          ? "review"
          : i % 3 === 0
            ? "proposal"
            : i % 2 === 0
              ? "discovery"
              : "delivery";

    const status: ProjectStatus = phase === "on_hold" ? "on_hold" : "active";

    list.push({
      id: `p${pIdx + 1}`,
      name: `${clientShortName(client.name)} ${domain} ${year}`,
      client_id: client.id,
      client_name: client.name,
      manager_id: mgr.id,
      manager_name: mgr.name,
      status,
      phase,
      start_date: `${2024 + (i % 2)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
      end_date: `${year + 1}-${String((i % 12) + 1).padStart(2, "0")}-30`,
      budget_eur: budgetBase,
      budget_consumed_eur: Math.round(budgetBase * consumedPct / 100),
      team_size: 2 + (i % 5),
    });
    pIdx++;
  }

  // 70 completed projects - spread across all clients
  for (let i = 0; i < 70; i++) {
    const client = CLIENTS[(i * 3) % CLIENTS.length] ?? CLIENTS[0]!;
    const domain = DOMAINS[(i + 4) % DOMAINS.length] ?? "Strategy";
    const year = 2023 + (i % 2);
    const mgr = managerPool[(i + 5) % managerPool.length] ?? managerPool[0]!;
    const budgetBase = 60000 + i * 8000;

    list.push({
      id: `p${pIdx + 1}`,
      name: `${clientShortName(client.name)} Phase ${(i % 3) + 1}`,
      client_id: client.id,
      client_name: client.name,
      manager_id: mgr.id,
      manager_name: mgr.name,
      status: "complete",
      phase: "complete",
      start_date: `${year - 1}-${String((i % 12) + 1).padStart(2, "0")}-01`,
      end_date: `${year}-${String(((i + 5) % 12) + 1).padStart(2, "0")}-30`,
      budget_eur: budgetBase,
      budget_consumed_eur: Math.round(budgetBase * (88 + (i % 12)) / 100),
      team_size: 2 + (i % 4),
    });
    pIdx++;
  }

  // 30 pipeline projects - discovery / proposal
  for (let i = 0; i < 30; i++) {
    const client = CLIENTS[(i * 5 + 2) % CLIENTS.length] ?? CLIENTS[0]!;
    const domain = DOMAINS[(i + 9) % DOMAINS.length] ?? "Transformation";
    const mgr = managerPool[(i + 9) % managerPool.length] ?? managerPool[0]!;
    const budgetBase = 40000 + i * 10000;

    list.push({
      id: `p${pIdx + 1}`,
      name: `${clientShortName(client.name)} ${domain} 2026`,
      client_id: client.id,
      client_name: client.name,
      manager_id: mgr.id,
      manager_name: mgr.name,
      status: "active",
      phase: i % 2 === 0 ? "discovery" : "proposal",
      start_date: `2026-${String((i % 12) + 1).padStart(2, "0")}-01`,
      end_date: `2026-${String(((i + 6) % 12) + 1).padStart(2, "0")}-30`,
      budget_eur: budgetBase,
      budget_consumed_eur: Math.round(budgetBase * (i % 15) / 100),
      team_size: 1 + (i % 3),
    });
    pIdx++;
  }

  return list;
}

export const PROJECTS: Project[] = buildProjects();

// ── Invoices (100) ───────────────────────────────────────────────────────────
// Types are imported from features/invoices/types.ts - single source of truth.
// Re-export for consumers that import from lib/mock-data.

export type { Invoice, InvoiceStatus } from "@/features/invoices/types";

const INVOICE_STATUSES: InvoiceStatus[] = [
  ...Array(6).fill("draft") as InvoiceStatus[],
  ...Array(22).fill("sent") as InvoiceStatus[],
  ...Array(60).fill("paid") as InvoiceStatus[],
  ...Array(6).fill("overdue") as InvoiceStatus[],
  ...Array(6).fill("void") as InvoiceStatus[],
];

const DAY_RATES = [1400, 1600, 1800, 2000, 2100, 2200, 2400];

function buildInvoices(): Invoice[] {
  const list: Invoice[] = [];

  for (let i = 0; i < 100; i++) {
    const client = CLIENTS[i % CLIENTS.length] ?? CLIENTS[0]!;
    const status: InvoiceStatus = INVOICE_STATUSES[i % INVOICE_STATUSES.length] ?? "sent";
    const invoiceYear = 2025 + (i % 2 === 0 ? 0 : 1);
    const month = (i % 12) + 1;
    const issueDate = `${invoiceYear}-${String(month).padStart(2, "0")}-01`;
    const dueDate = `${invoiceYear}-${String(month).padStart(2, "0")}-30`;
    const proj = PROJECTS[i % PROJECTS.length];
    const currency = client.currency;
    const dayRate = DAY_RATES[i % DAY_RATES.length] ?? 1800;
    const days = 3 + (i % 8);
    const subtotal = dayRate * days;
    const taxRate = currency === "GBP" ? 0.20 : 0.20;
    const taxAmount = subtotal * taxRate;

    list.push({
      id: `inv${i + 1}`,
      number: `INV-${invoiceYear}-${String(i + 1).padStart(4, "0")}`,
      client_id: client.id,
      client_name: client.name,
      currency,
      status,
      issue_date: issueDate,
      due_date: dueDate,
      paid_date: status === "paid" ? dueDate : undefined,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total: subtotal + taxAmount,
      project_id: proj?.id,
      project_name: proj?.name,
      ai_generated: i % 5 === 0,
      line_items: [
        {
          id: `li${i + 1}-1`,
          description: `${proj?.name ?? "Consulting"} - ${String(month).padStart(2, "0")}/${invoiceYear} (${days} days x ${currency === "GBP" ? "£" : "€"}${dayRate}/day)`,
          quantity: days,
          unit_price: dayRate,
          amount: subtotal,
        },
      ],
    });
  }

  return list;
}

export const INVOICES: Invoice[] = buildInvoices();

// ── Expenses (150) ───────────────────────────────────────────────────────────
// Types are imported from features/expenses/types.ts - single source of truth.
// Re-export for consumers that import from lib/mock-data.

export type { Expense, ExpenseCategory, ExpenseStatus } from "@/features/expenses/types";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "travel", "meals", "accommodation", "equipment",
  "software", "training", "other",
];

const EXPENSE_DESCRIPTIONS: Record<ExpenseCategory, string[]> = {
  travel: ["Eurostar Paris-London", "TGV Paris-Lyon", "Taxi to client site", "Flight CDG-LHR"],
  meals: ["Client lunch", "Team dinner", "Working lunch"],
  accommodation: ["Hotel Ibis - overnight", "Marriott - client visit", "Novotel conference stay"],
  equipment: ["Keyboard replacement", "Monitor cable", "USB hub"],
  software: ["Notion license", "Adobe license renewal", "Zoom annual plan"],
  training: ["Agile certification", "AWS training", "Leadership workshop fee"],
  other: ["Office supplies", "Printing costs", "Conference registration"],
};

function buildExpenses(): Expense[] {
  const list: Expense[] = [];
  const statusPool: ExpenseStatus[] = [
    ...Array(37).fill("submitted") as ExpenseStatus[],
    ...Array(75).fill("approved") as ExpenseStatus[],
    ...Array(23).fill("reimbursed") as ExpenseStatus[],
    ...Array(15).fill("rejected") as ExpenseStatus[],
  ];

  for (let i = 0; i < 150; i++) {
    const emp = EMPLOYEES[i % EMPLOYEES.length] ?? EMPLOYEES[0]!;
    const status: ExpenseStatus = statusPool[i % statusPool.length] ?? "submitted";
    const category: ExpenseCategory = EXPENSE_CATEGORIES[i % EXPENSE_CATEGORIES.length] ?? "travel";
    const descriptions = EXPENSE_DESCRIPTIONS[category];
    const description = descriptions[i % descriptions.length] ?? category;
    const month = (i % 12) + 1;
    const expenseDate = `2025-${String(month).padStart(2, "0")}-${String(5 + (i % 20)).padStart(2, "0")}`;
    const proj = i % 3 === 0 ? PROJECTS[i % PROJECTS.length] : undefined;
    const amount = 20 + i * 18;
    const isApproved = status === "approved" || status === "reimbursed";

    list.push({
      id: `exp${i + 1}`,
      employee_id: emp.id,
      employee_name: emp.name,
      category,
      description: `${description} - ${emp.name.split(" ")[0] ?? emp.name}`,
      amount,
      currency: "EUR",
      expense_date: expenseDate,
      status,
      billable: i % 4 !== 0,
      project_id: proj?.id,
      project_name: proj?.name,
      client_name: proj ? CLIENTS[i % CLIENTS.length]?.name : undefined,
      submitted_at: `2025-${String(month).padStart(2, "0")}-${String(5 + (i % 20)).padStart(2, "0")}T09:00:00Z`,
      approved_at: isApproved ? `2025-${String(month).padStart(2, "0")}-${String(6 + (i % 20)).padStart(2, "0")}T10:00:00Z` : undefined,
      rejection_reason: status === "rejected" ? "Missing receipt or out-of-policy amount" : undefined,
    });
  }

  return list;
}

export const EXPENSES: Expense[] = buildExpenses();

// ── Leaves (100) ─────────────────────────────────────────────────────────────
// Types are imported from features/leaves/types.ts - single source of truth.
// Re-export for consumers that import from lib/mock-data.

export type { LeaveRequest, LeaveStatus, LeaveType } from "@/features/leaves/types";

const LEAVE_TYPES: LeaveType[] = [
  "annual", "annual", "annual",
  "sick", "sick",
  "parental",
  "unpaid",
  "compassionate",
  "public_holiday",
];

function buildLeaves(): LeaveRequest[] {
  const list: LeaveRequest[] = [];
  // 450 approved, 150 pending, 100 rejected in total
  // UI sample of 100: 64 approved, 22 pending, 14 rejected
  const statusPool: LeaveStatus[] = [
    ...Array(64).fill("approved") as LeaveStatus[],
    ...Array(22).fill("pending") as LeaveStatus[],
    ...Array(14).fill("rejected") as LeaveStatus[],
  ];

  for (let i = 0; i < 100; i++) {
    const emp = EMPLOYEES[i % EMPLOYEES.length] ?? EMPLOYEES[0]!;
    const status: LeaveStatus = statusPool[i % statusPool.length] ?? "pending";
    const leaveType: LeaveType = LEAVE_TYPES[i % LEAVE_TYPES.length] ?? "annual";
    const month = (i % 11) + 1;
    const startDay = 5 + (i % 20);
    const days = 1 + (i % 5);
    const isReviewed = status === "approved" || status === "rejected";

    list.push({
      id: `leave${i + 1}`,
      employee_id: emp.id,
      employee_name: emp.name,
      type: leaveType,
      status,
      start_date: `2025-${String(month).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`,
      end_date: `2025-${String(month).padStart(2, "0")}-${String(startDay + days - 1).padStart(2, "0")}`,
      days,
      submitted_at: `2025-${String(month).padStart(2, "0")}-${String(Math.max(1, startDay - 7)).padStart(2, "0")}T09:00:00Z`,
      reviewed_at: isReviewed ? `2025-${String(month).padStart(2, "0")}-${String(Math.max(1, startDay - 5)).padStart(2, "0")}T10:00:00Z` : undefined,
      reviewer_note: status === "rejected" ? "Conflicts with project deadline or team capacity" : undefined,
    });
  }

  return list;
}

export const LEAVES: LeaveRequest[] = buildLeaves();

// ── Dashboard KPIs ────────────────────────────────────────────────────────────

const activeProjects = PROJECTS.filter((p) => p.status === "active").length;
const pendingExpenses = EXPENSES.filter((e) => e.status === "submitted");
const outstandingInvoices = INVOICES.filter((i) => i.status === "sent" || i.status === "draft");
const overdueInvoices = INVOICES.filter((i) => i.status === "overdue");

export const DASHBOARD_KPIS: DashboardKpis = {
  employees_total: EMPLOYEES.length,                // 201
  clients_total: CLIENTS.length,                    // 120
  projects_total: PROJECTS.length,                  // 260
  projects_active: activeProjects,
  timesheets_hours_this_week: 37.5,
  timesheets_target_hours: 40,
  expenses_pending_count: pendingExpenses.length,
  expenses_pending_eur: pendingExpenses.reduce((s, e) => s + e.amount, 0),
  invoices_outstanding_count: outstandingInvoices.length,
  invoices_outstanding_amount: outstandingInvoices.reduce((s, i) => s + i.total, 0),
  invoices_overdue_count: overdueInvoices.length,
  pending_approvals: pendingExpenses.length + LEAVES.filter((l) => l.status === "pending").length,
};
