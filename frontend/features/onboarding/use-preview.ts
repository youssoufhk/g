"use client";

import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export type EntityType = "employees" | "clients" | "projects" | "teams";

export type ColumnMapping = {
  source_header: string;
  target_field: string | null;
  confidence: number;
  reason: string | null;
};

export type RowValidationError = {
  row_index: number;
  field: string | null;
  message: string;
};

export type PreviewResponse = {
  entity_type: EntityType;
  headers: string[];
  row_count: number;
  mapping: ColumnMapping[];
  preview_rows: { [key: string]: string }[];
  errors: RowValidationError[];
  ai_explanation: string | null;
};

export type CommitResponse = {
  entity_type: EntityType;
  imported: number;
  skipped: number;
  errors: RowValidationError[];
};

export function usePreviewCsv() {
  return useMutation({
    mutationFn: async (input: { file: File; entityType: EntityType }) => {
      const form = new FormData();
      form.append("entity_type", input.entityType);
      form.append("file", input.file);
      return apiFetch<PreviewResponse>("/imports/preview", {
        method: "POST",
        body: form,
      });
    },
  });
}

export function useCommitImport() {
  return useMutation({
    mutationFn: async (input: {
      file: File;
      entityType: EntityType;
      confirmedMapping: ColumnMapping[];
    }) => {
      const form = new FormData();
      form.append("entity_type", input.entityType);
      form.append("file", input.file);
      form.append("confirmed_mapping", JSON.stringify(input.confirmedMapping));
      return apiFetch<CommitResponse>("/imports/commit", {
        method: "POST",
        body: form,
        headers: { "Idempotency-Key": newIdempotencyKey() },
      });
    },
  });
}
