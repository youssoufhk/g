"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Radio } from "@/components/ui/radio";

/**
 * Composite pattern per `specs/DESIGN_SYSTEM.md §5.11`. Triggered by HTTP
 * 409 from `useOptimisticMutation`. Two-column field-by-field diff with
 * radio selection per field; array fields are opaque; large text fields
 * truncate with a "Show full" toggle.
 *
 * Footer: Cancel (ghost, left) | Take theirs | Keep mine | Merge (primary, right).
 *
 * The pattern is controlled (open/onResolve) and hosted by the provider.
 * Esc or backdrop resolve with `{type: "cancel"}` through a single path;
 * the provider sets `pending=null` once and closes the modal.
 *
 * Accessibility:
 *  - Outer list has `role="group"` with `aria-label` from the diff label.
 *  - Each row is its own `role="radiogroup"` with `aria-labelledby` on the
 *    field-name span so arrow-key navigation scopes correctly.
 *  - Each row pre-selects "mine" on open so the radiogroup has a tab stop
 *    and the user's draft is the honest default.
 *  - Long text (> 200 chars) collapses with `aria-expanded` on the toggle.
 */

export type ConflictFieldKind = "text" | "number" | "date" | "array";

export type ConflictField = {
  field: string;
  label: string;
  yours: unknown;
  theirs: unknown;
  kind?: ConflictFieldKind;
};

export type ConflictResolution =
  | { type: "keep-mine" }
  | { type: "take-theirs" }
  | { type: "merge"; selections: Record<string, "mine" | "theirs"> }
  | { type: "cancel" };

export type ConflictResolverProps = {
  open: boolean;
  fields: ConflictField[];
  onResolve: (resolution: ConflictResolution) => void;
};

const LONG_TEXT_LIMIT = 200;

function formatValue(value: unknown, kind: ConflictFieldKind): string {
  if (value === null || value === undefined) return "";
  if (kind === "array") {
    if (Array.isArray(value)) {
      return value.length === 1 ? "1 item" : `${value.length} items`;
    }
    return String(value);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ConflictResolver({
  open,
  fields,
  onResolve,
}: ConflictResolverProps) {
  const t = useTranslations("conflict_resolver");
  const rowIdPrefix = useId();
  const [selections, setSelections] = useState<
    Record<string, "mine" | "theirs">
  >({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const defaultedFields = useMemo(
    () => fields.map((f) => ({ ...f, kind: f.kind ?? "text" })),
    [fields],
  );

  // Pre-select "mine" for every field on open. The user authored the edit;
  // their side is the honest default, and a pre-checked radio per row
  // gives each radiogroup a legal tab stop (WCAG keyboard reach).
  useEffect(() => {
    if (!open) return;
    const init: Record<string, "mine" | "theirs"> = {};
    for (const f of defaultedFields) init[f.field] = "mine";
    setSelections(init);
    setExpanded({});
  }, [open, defaultedFields]);

  const handleMerge = () => {
    const merged: Record<string, "mine" | "theirs"> = {};
    for (const f of defaultedFields) {
      merged[f.field] = selections[f.field] ?? "mine";
    }
    onResolve({ type: "merge", selections: merged });
  };

  const handleKeepMine = () => onResolve({ type: "keep-mine" });
  const handleTakeTheirs = () => onResolve({ type: "take-theirs" });
  const handleCancel = () => onResolve({ type: "cancel" });

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title={t("title")}
      description={t("subtitle")}
      className="conflict-resolver"
      footer={
        <div
          className="conflict-resolver-footer"
          role="group"
          aria-label={t("actions_label")}
        >
          <Button variant="ghost" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <div className="conflict-resolver-primary-actions">
            <Button variant="secondary" onClick={handleTakeTheirs}>
              {t("take_theirs")}
            </Button>
            <Button variant="secondary" onClick={handleKeepMine}>
              {t("keep_mine")}
            </Button>
            <Button variant="primary" onClick={handleMerge}>
              {t("merge_and_continue")}
            </Button>
          </div>
        </div>
      }
    >
      <div
        className="conflict-resolver-list"
        role="group"
        aria-label={t("diff_label")}
      >
        <div className="conflict-resolver-list-header" aria-hidden>
          <span>{t("field")}</span>
          <span>{t("your_value")}</span>
          <span>{t("their_value")}</span>
        </div>
        {defaultedFields.map((field) => {
          const selected = selections[field.field];
          const kind = field.kind ?? "text";
          const yoursText = formatValue(field.yours, kind);
          const theirsText = formatValue(field.theirs, kind);
          const isLongText =
            kind === "text" &&
            (yoursText.length > LONG_TEXT_LIMIT ||
              theirsText.length > LONG_TEXT_LIMIT);
          const isExpanded = expanded[field.field] ?? false;
          const display = (raw: string) =>
            !isLongText || isExpanded
              ? raw
              : raw.slice(0, LONG_TEXT_LIMIT) + "\u2026";
          const nameId = `${rowIdPrefix}-${field.field}-name`;
          const radioName = `conflict-${rowIdPrefix}-${field.field}`;

          return (
            <div
              key={field.field}
              className="conflict-resolver-row"
              data-field={field.field}
              data-selected={selected ?? "unset"}
              role="radiogroup"
              aria-labelledby={nameId}
            >
              <div className="conflict-resolver-row-label">
                <span id={nameId} className="conflict-resolver-field-name">
                  {field.label}
                </span>
                {kind === "array" && (
                  <span className="conflict-resolver-field-hint">
                    {t("array_hint")}
                  </span>
                )}
                {isLongText && (
                  <Button
                    variant="link"
                    size="xs"
                    className="conflict-resolver-expand"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [field.field]: !isExpanded,
                      }))
                    }
                  >
                    {isExpanded ? t("show_less") : t("show_full")}
                  </Button>
                )}
              </div>
              <label
                className="conflict-resolver-value conflict-resolver-value-mine"
                data-active={selected === "mine" || undefined}
              >
                <Radio
                  name={radioName}
                  value="mine"
                  checked={selected === "mine"}
                  onChange={() =>
                    setSelections((prev) => ({
                      ...prev,
                      [field.field]: "mine",
                    }))
                  }
                  aria-label={t("keep_mine_field", { field: field.label })}
                />
                <span className="conflict-resolver-value-text">
                  {display(yoursText) || (
                    <span className="conflict-resolver-value-empty">
                      {t("empty")}
                    </span>
                  )}
                </span>
              </label>
              <label
                className="conflict-resolver-value conflict-resolver-value-theirs"
                data-active={selected === "theirs" || undefined}
              >
                <Radio
                  name={radioName}
                  value="theirs"
                  checked={selected === "theirs"}
                  onChange={() =>
                    setSelections((prev) => ({
                      ...prev,
                      [field.field]: "theirs",
                    }))
                  }
                  aria-label={t("take_theirs_field", { field: field.label })}
                />
                <span className="conflict-resolver-value-text">
                  {display(theirsText) || (
                    <span className="conflict-resolver-value-empty">
                      {t("empty")}
                    </span>
                  )}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
