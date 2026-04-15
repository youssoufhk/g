/**
 * Tenant-scoped IndexedDB queue stub for offline timesheet entries.
 *
 * Phase 5 fills in real IndexedDB storage and the sync worker. The skeleton
 * exists so the TimesheetGrid can already call ``enqueue`` today and the
 * signature stays stable.
 */

export type QueuedMutation = {
  id: string;
  tenantSchema: string;
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body: unknown;
  createdAt: number;
};

const memory: QueuedMutation[] = [];

export async function enqueue(mutation: QueuedMutation): Promise<void> {
  memory.push(mutation);
}

export async function drain(): Promise<QueuedMutation[]> {
  const copy = memory.slice();
  memory.length = 0;
  return copy;
}

export async function peek(): Promise<QueuedMutation[]> {
  return memory.slice();
}
