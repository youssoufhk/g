export type FeatureFlagOut = {
  key: string;
  description: string;
  default_enabled: boolean;
  kill_switch: boolean;
  tenant_overrides: Record<string, boolean>;
};

export type TenantOut = {
  id: number;
  schema_name: string;
  display_name: string;
  residency_region: string;
  legal_jurisdiction: string;
  base_currency: string;
  primary_locale: string;
  supported_locales: string[];
  status: "provisioning" | "active" | "suspended" | "legal_hold" | "offboarded";
  created_at: string;
};
