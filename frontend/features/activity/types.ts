export type ActivityDiff = {
  field: string;
  before: string | number | null;
  after: string | number | null;
};

export type AuditEntry = {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  occurred_at: string;
  diff: ActivityDiff[];
};
