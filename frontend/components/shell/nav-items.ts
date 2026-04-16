import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Umbrella,
  Receipt,
  Folder,
  BarChart2,
  CalendarRange,
  Building2,
  FileText,
  Users,
  Briefcase,
  Lightbulb,
  Settings,
  CheckSquare,
  UserCircle2,
  Keyboard,
} from "lucide-react";

/**
 * Single source of truth for sidebar + bottom-nav navigation. Matches the
 * prototype `_shared.js` GHR.renderSidebar() structure: 5 sections + footer,
 * min-role gates mirrored via the `minRole` field. Labels come from
 * `messages/<locale>.json` via `nav.*` and `nav.sections.*` keys.
 */
export type NavRole = "employee" | "pm" | "admin";

export type NavItem = {
  key: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  messageKey:
    | "dashboard"
    | "calendar"
    | "timesheets"
    | "leaves"
    | "expenses"
    | "projects"
    | "gantt"
    | "planning"
    | "clients"
    | "invoices"
    | "employees"
    | "hr"
    | "insights"
    | "admin"
    | "approvals"
    | "account"
    | "help";
  minRole?: NavRole;
};

export type NavSection = {
  key: "my-week" | "delivery" | "finance" | "people" | "admin";
  items: NavItem[];
  minRole?: NavRole;
};

export const navSections: NavSection[] = [
  {
    key: "my-week",
    items: [
      { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, messageKey: "dashboard" },
      { key: "timesheets", href: "/timesheets", icon: Clock, messageKey: "timesheets" },
      { key: "leaves", href: "/leaves", icon: Umbrella, messageKey: "leaves" },
      { key: "expenses", href: "/expenses", icon: Receipt, messageKey: "expenses" },
    ],
  },
  {
    key: "delivery",
    minRole: "pm",
    items: [
      { key: "projects", href: "/projects", icon: Folder, messageKey: "projects" },
      { key: "clients", href: "/clients", icon: Building2, messageKey: "clients" },
      { key: "calendar", href: "/calendar", icon: Calendar, messageKey: "calendar" },
      { key: "gantt", href: "/gantt", icon: BarChart2, messageKey: "gantt" },
      { key: "planning", href: "/planning", icon: CalendarRange, messageKey: "planning" },
    ],
  },
  {
    key: "finance",
    minRole: "pm",
    items: [
      { key: "invoices", href: "/invoices", icon: FileText, messageKey: "invoices" },
    ],
  },
  {
    key: "people",
    minRole: "pm",
    items: [
      { key: "employees", href: "/employees", icon: Users, messageKey: "employees" },
      { key: "human-resources", href: "/hr", icon: Briefcase, messageKey: "hr" },
      { key: "insights", href: "/insights", icon: Lightbulb, messageKey: "insights" },
    ],
  },
  {
    key: "admin",
    minRole: "admin",
    items: [
      { key: "admin", href: "/admin", icon: Settings, messageKey: "admin" },
    ],
  },
];

export const footerNav: NavItem[] = [
  { key: "approvals", href: "/approvals", icon: CheckSquare, messageKey: "approvals", minRole: "pm" },
  { key: "account", href: "/account", icon: UserCircle2, messageKey: "account" },
  { key: "help", href: "/help", icon: Keyboard, messageKey: "help" },
];

/**
 * 5-slot bottom nav for mobile. Matches DESIGN_SYSTEM.md section 3.4:
 * Dashboard, Timesheets, Leaves, Approvals (badge), More.
 */
export const bottomNav: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, messageKey: "dashboard" },
  { key: "timesheets", href: "/timesheets", icon: Clock, messageKey: "timesheets" },
  { key: "leaves", href: "/leaves", icon: Umbrella, messageKey: "leaves" },
  { key: "approvals", href: "/approvals", icon: CheckSquare, messageKey: "approvals", minRole: "pm" },
  { key: "account", href: "/account", icon: UserCircle2, messageKey: "account" },
];

/**
 * Back-compat shim for any callsite that still imports primaryNav /
 * secondaryNav. Prefer `navSections` in new code.
 */
export const primaryNav: NavItem[] = navSections.flatMap((s) => s.items);
export const secondaryNav: NavItem[] = footerNav;
