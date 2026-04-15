import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  Clock,
  CalendarDays,
  Receipt,
  CheckSquare,
  FileText,
  Calendar,
  LineChart,
  Shield,
  UserCircle2,
  HelpCircle,
} from "lucide-react";

export type NavItem = {
  key: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  messageKey:
    | "dashboard"
    | "employees"
    | "clients"
    | "projects"
    | "timesheets"
    | "leaves"
    | "expenses"
    | "approvals"
    | "invoices"
    | "calendar"
    | "gantt"
    | "planning"
    | "hr"
    | "insights"
    | "admin"
    | "account"
    | "help";
};

export const primaryNav: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, messageKey: "dashboard" },
  { key: "employees", href: "/employees", icon: Users, messageKey: "employees" },
  { key: "clients", href: "/clients", icon: Briefcase, messageKey: "clients" },
  { key: "projects", href: "/projects", icon: FolderKanban, messageKey: "projects" },
  { key: "timesheets", href: "/timesheets", icon: Clock, messageKey: "timesheets" },
  { key: "leaves", href: "/leaves", icon: CalendarDays, messageKey: "leaves" },
  { key: "expenses", href: "/expenses", icon: Receipt, messageKey: "expenses" },
  { key: "approvals", href: "/approvals", icon: CheckSquare, messageKey: "approvals" },
  { key: "invoices", href: "/invoices", icon: FileText, messageKey: "invoices" },
];

export const secondaryNav: NavItem[] = [
  { key: "calendar", href: "/calendar", icon: Calendar, messageKey: "calendar" },
  { key: "insights", href: "/insights", icon: LineChart, messageKey: "insights" },
  { key: "admin", href: "/admin", icon: Shield, messageKey: "admin" },
  { key: "account", href: "/account", icon: UserCircle2, messageKey: "account" },
  { key: "help", href: "/help", icon: HelpCircle, messageKey: "help" },
];

export const bottomNav: NavItem[] = [
  primaryNav[0],
  primaryNav[4],
  primaryNav[6],
  primaryNav[7],
  secondaryNav[3],
];
