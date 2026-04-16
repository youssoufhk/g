export type ExpenseCategory =
  | "travel"
  | "meals"
  | "accommodation"
  | "equipment"
  | "software"
  | "training"
  | "other";

export type ExpenseStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "reimbursed";

export type Expense = {
  id: string;
  employee_id: string;
  employee_name: string;
  project_id?: string;
  project_name?: string;
  client_name?: string;
  category: ExpenseCategory;
  description: string;
  amount: number; // in the currency's native unit (e.g., 89.50 for EUR 89.50)
  currency: "EUR" | "GBP" | "USD";
  expense_date: string; // ISO date
  status: ExpenseStatus;
  billable: boolean;
  receipt_url?: string; // URL to uploaded receipt
  rejection_reason?: string;
  submitted_at?: string; // ISO datetime
  approved_at?: string;
};

export type ExpenseListFilters = {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  project_id?: string;
  search?: string;
};
