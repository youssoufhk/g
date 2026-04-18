"use client";

import { useState, useRef, useId, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Upload, Sparkles, FileX, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTableWrapper,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/ui/table";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorBoundary } from "@/components/patterns/error-boundary";
import { PageHeader } from "@/components/patterns/page-header";
import { ApiClientError } from "@/lib/api-client";
import {
  usePreviewCsv,
  useCommitImport,
  type EntityType,
  type ColumnMapping,
  type PreviewResponse,
  type CommitResponse,
} from "@/features/onboarding/use-preview";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const TARGET_FIELDS: Record<EntityType, string[]> = {
  employees: ["first_name", "last_name", "email", "role", "team", "hire_date", "manager_id", "base_currency"],
  clients: ["name", "country_code", "currency", "primary_contact_name", "primary_contact_email", "size_band"],
  projects: ["name", "client_id", "status", "budget_minor_units", "currency", "start_date", "end_date", "owner_employee_id"],
  teams: ["name", "lead_employee_id"],
};

const ENTITY_LABEL_KEYS = {
  employees: "entity_employees",
  clients: "entity_clients",
  projects: "entity_projects",
  teams: "entity_teams",
} as const satisfies Record<EntityType, string>;

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");

  const [step, setStep] = useState<Step>(1);
  const [entityType, setEntityType] = useState<EntityType>("employees");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [editedMapping, setEditedMapping] = useState<ColumnMapping[]>([]);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);

  const previewMutation = usePreviewCsv();
  const commitMutation = useCommitImport();

  const STEPS: { id: Step; label: string }[] = [
    { id: 1, label: t("step_welcome") },
    { id: 2, label: t("step_upload") },
    { id: 3, label: t("step_preview") },
    { id: 4, label: t("step_done") },
  ];

  const entityLabel = t(ENTITY_LABEL_KEYS[entityType]);
  const currentStepLabel = STEPS.find((s) => s.id === step)?.label ?? "";

  function validateFile(f: File): string | null {
    if (!f.name.toLowerCase().endsWith(".csv") && f.type !== "text/csv") {
      return t("upload_error_type");
    }
    if (f.size > MAX_FILE_BYTES) {
      return t("upload_error_size");
    }
    return null;
  }

  function handleFileChange(f: File | null) {
    setFile(f);
    setFileError(f ? validateFile(f) : null);
    previewMutation.reset();
  }

  async function runPreview() {
    if (!file) return;
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setFileError(null);
    try {
      const result = await previewMutation.mutateAsync({ file, entityType });
      setPreview(result);
      setEditedMapping(result.mapping);
      setStep(3);
    } catch {
      // surfaced via previewMutation.error
    }
  }

  async function runCommit() {
    if (!file || !preview) return;
    try {
      const result = await commitMutation.mutateAsync({ file, entityType, confirmedMapping: editedMapping });
      setCommitResult(result);
      setStep(4);
    } catch {
      // surfaced via commitMutation.error
    }
  }

  function humanizePreviewError(err: unknown): string {
    if (err instanceof ApiClientError) {
      if (err.status === 400) return t("upload_error_400");
      if (err.status === 413) return t("upload_error_413");
    }
    return t("upload_error_generic");
  }

  function humanizeCommitError(err: unknown): string {
    if (err instanceof ApiClientError) {
      if (err.status === 401) return t("preview_commit_error_401");
      if (err.status === 400) return t("preview_commit_error_400");
      if (err.status === 413) return t("preview_commit_error_413");
      if (err.status === 422) return t("preview_commit_error_422");
    }
    return t("preview_commit_error_generic");
  }

  const errorFallback = (
    <EmptyState
      icon={FileX}
      title={t("error_boundary_title")}
      description={t("error_boundary_desc")}
      action={
        <Button onClick={() => window.location.reload()}>
          {t("error_boundary_reload")}
        </Button>
      }
    />
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <PageHeader title={t("title")} subtitle={t("subtitle")} />

        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "var(--color-surface-0)",
            paddingTop: "var(--space-2)",
            paddingBottom: "var(--space-2)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-overline)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {t("progress_label", { current: step, total: STEPS.length })}
            </span>
            <span
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-1)",
              }}
            >
              {currentStepLabel}
            </span>
          </div>
          <Stepper current={step} steps={STEPS} />
        </div>

        {/* Announces step transitions to screen readers */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {t("step_aria", { current: step, total: STEPS.length, name: currentStepLabel })}
        </div>

        {step === 1 && <WelcomeStep t={t} onNext={() => setStep(2)} />}

        {step === 2 && (
          <div aria-busy={previewMutation.isPending} aria-live="polite">
            {previewMutation.isPending ? (
              <PreviewSkeleton t={t} />
            ) : (
              <UploadStep
                t={t}
                entityType={entityType}
                onEntityChange={(et) => { setEntityType(et); previewMutation.reset(); }}
                file={file}
                onFileChange={handleFileChange}
                fileError={fileError}
                onBack={() => setStep(1)}
                onPreview={runPreview}
                pending={previewMutation.isPending}
                error={previewMutation.error ? humanizePreviewError(previewMutation.error) : null}
              />
            )}
          </div>
        )}

        {step === 3 && preview && (
          <div aria-busy={commitMutation.isPending} aria-live="polite">
            <PreviewStep
              t={t}
              preview={preview}
              entityType={entityType}
              editedMapping={editedMapping}
              onMappingChange={setEditedMapping}
              onBack={() => setStep(2)}
              onConfirm={runCommit}
              pending={commitMutation.isPending}
              error={commitMutation.error ? humanizeCommitError(commitMutation.error) : null}
            />
          </div>
        )}

        {step === 4 && (
          <DoneStep
            t={t}
            result={commitResult}
            entityLabel={entityLabel}
            onDashboard={() => router.push("/dashboard")}
            onAnother={() => {
              setStep(1);
              setFile(null);
              setFileError(null);
              setPreview(null);
              setEditedMapping([]);
              setCommitResult(null);
              previewMutation.reset();
              commitMutation.reset();
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

function Stepper({ current, steps }: { current: Step; steps: { id: Step; label: string }[] }) {
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {steps.map((s, idx) => {
            const done = s.id < current;
            const active = s.id === current;
            const dotBg = done
              ? "var(--color-success)"
              : active
                ? "var(--color-primary)"
                : "var(--color-surface-2)";
            const dotColor = done || active ? "var(--color-text-inv)" : "var(--color-text-3)";
            const labelColor = active ? "var(--color-text-1)" : "var(--color-text-3)";

            return (
              <div
                key={s.id}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: 1 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <div
                    aria-current={active ? "step" : undefined}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      background: dotBg,
                      color: dotColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--text-body-sm)",
                      fontWeight: "var(--weight-semibold)",
                      flexShrink: 0,
                    }}
                  >
                    {done ? <Check size={16} aria-hidden /> : s.id}
                  </div>
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize: "var(--text-body-sm)",
                      fontWeight: active ? "var(--weight-semibold)" : "var(--weight-regular)",
                      color: labelColor,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: "var(--color-border-subtle)",
                      margin: "0 var(--space-2)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type TFn = ReturnType<typeof useTranslations>;

function PreviewSkeleton({ t }: { t: TFn }) {
  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Sparkles size={16} aria-hidden style={{ color: "var(--color-primary)" }} />
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-2)",
            }}
          >
            {t("preview_skeleton_label")}
          </span>
        </div>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {/* mimic table: header row + 4 data rows */}
        <Skeleton variant="title" width="40%" />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ display: "flex", gap: "var(--space-4)" }}>
              <Skeleton variant="text" width="25%" />
              <Skeleton variant="text" width="25%" />
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="35%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ t, onNext }: { t: TFn; onNext: () => void }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{t("welcome_title")}</span>
        <Badge tone="accent">
          <Sparkles size={12} aria-hidden /> {t("welcome_badge")}
        </Badge>
      </div>
      <div className="card-body">
        <p className="text-2" style={{ marginBottom: "var(--space-4)" }}>
          {t("welcome_body")}
        </p>

        <ol
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {[
            { n: 1, title: t("welcome_step1_title"), body: t("welcome_step1_body") },
            { n: 2, title: t("welcome_step2_title"), body: t("welcome_step2_body") },
            { n: 3, title: t("welcome_step3_title"), body: t("welcome_step3_body") },
          ].map((item) => (
            <li key={item.n} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-body-sm)",
                  fontWeight: "var(--weight-semibold)",
                  flexShrink: 0,
                }}
              >
                {item.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text-1)",
                  }}
                >
                  {item.title}
                </div>
                <p className="text-2 text-sm" style={{ marginTop: "2px" }}>
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={onNext} trailingIcon={<ArrowRight size={16} aria-hidden />}>
          {t("welcome_cta")}
        </Button>
      </div>
    </div>
  );
}

function UploadStep(props: {
  t: TFn;
  entityType: EntityType;
  onEntityChange: (value: EntityType) => void;
  file: File | null;
  onFileChange: (value: File | null) => void;
  fileError: string | null;
  onBack: () => void;
  onPreview: () => void;
  pending: boolean;
  error: string | null;
}) {
  const { t } = props;
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    props.onFileChange(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0] ?? null;
    if (dropped) props.onFileChange(dropped);
  }

  const canPreview = Boolean(props.file) && !props.fileError && !props.pending;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{t("upload_title")}</span>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label" htmlFor="entity-type">
            {t("upload_entity_label")}
          </label>
          <Select
            id="entity-type"
            value={props.entityType}
            onChange={(event) => props.onEntityChange(event.target.value as EntityType)}
          >
            {(["employees", "clients", "projects", "teams"] as EntityType[]).map((key) => (
              <option key={key} value={key}>
                {t(ENTITY_LABEL_KEYS[key])}
              </option>
            ))}
          </Select>
        </div>

        <div className="form-group">
          {/* label wraps the hidden input so assistive tech links to it correctly */}
          <label className="form-label" htmlFor={fileInputId}>
            {t("upload_file_label")}
          </label>
          <div
            className={`upload-zone${dragActive ? " dragover" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label={t("upload_file_label")}
            aria-describedby="upload-constraint"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <Upload size={24} aria-hidden />
            <div
              style={{
                fontSize: "var(--text-body)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-1)",
              }}
            >
              {props.file ? props.file.name : t("upload_drop_hint")}
            </div>
            <div id="upload-constraint" className="text-3 text-caption">
              {t("upload_constraint")}
            </div>
            <input
              ref={inputRef}
              id={fileInputId}
              type="file"
              accept=".csv,text/csv"
              onChange={handleSelect}
              style={{ display: "none" }}
            />
          </div>

          {props.fileError && (
            <p className="text-error text-sm" role="alert" style={{ marginTop: "var(--space-2)" }}>
              {props.fileError}
            </p>
          )}
        </div>

        {props.error && (
          <p className="text-error text-sm" role="alert">
            {props.error}
          </p>
        )}
      </div>
      <div
        className="card-footer"
        style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}
      >
        <Button
          variant="ghost"
          onClick={props.onBack}
          leadingIcon={<ArrowLeft size={16} aria-hidden />}
        >
          {t("upload_back")}
        </Button>
        <Button
          onClick={props.onPreview}
          disabled={!canPreview}
          loading={props.pending}
          trailingIcon={<ArrowRight size={16} aria-hidden />}
        >
          {t("upload_preview_cta")}
        </Button>
      </div>
    </div>
  );
}

function PreviewStep(props: {
  t: TFn;
  preview: PreviewResponse;
  entityType: EntityType;
  editedMapping: ColumnMapping[];
  onMappingChange: (mapping: ColumnMapping[]) => void;
  onBack: () => void;
  onConfirm: () => void;
  pending: boolean;
  error: string | null;
}) {
  const { t, preview, entityType, editedMapping } = props;
  const hasErrors = preview.errors.length > 0;
  const fieldOptions = TARGET_FIELDS[entityType];

  const usedTargets = editedMapping
    .map((m) => m.target_field)
    .filter((f): f is string => f !== null);

  function updateMapping(sourceHeader: string, targetField: string | null) {
    props.onMappingChange(
      editedMapping.map((m) =>
        m.source_header === sourceHeader ? { ...m, target_field: targetField } : m,
      ),
    );
  }

  if (preview.row_count === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className="card">
          <div className="card-body">
            <EmptyState
              icon={FileX}
              title={t("preview_empty_title")}
              description={t("preview_empty_desc")}
            />
          </div>
        </div>
        <div className="card-footer" style={{ display: "flex" }}>
          <Button
            variant="ghost"
            onClick={props.onBack}
            leadingIcon={<ArrowLeft size={16} aria-hidden />}
          >
            {t("preview_back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">{t("preview_title")}</span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Badge tone="info">{t("preview_rows_badge", { count: preview.row_count })}</Badge>
            <Badge tone={hasErrors ? "error" : "success"}>
              {hasErrors
                ? t("preview_issues_badge", { count: preview.errors.length })
                : t("preview_clean_badge")}
            </Badge>
          </div>
        </div>
        <div className="card-body">
          {preview.ai_explanation && (
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                background: "var(--color-primary-muted)",
                borderRadius: "var(--radius-md)",
                marginBottom: "var(--space-4)",
              }}
            >
              <Info size={16} aria-hidden style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div
                  style={{
                    fontSize: "var(--text-body-sm)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-primary)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {t("preview_ai_label")}
                </div>
                <p className="text-2 text-sm">{preview.ai_explanation}</p>
              </div>
            </div>
          )}

          <p className="text-2 text-sm" style={{ marginBottom: "var(--space-4)" }}>
            {t("preview_lead", { matched: usedTargets.length, total: editedMapping.length })}
          </p>

          <h4
            style={{
              fontSize: "var(--text-overline)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--space-2)",
            }}
          >
            {t("preview_mapping_label")}
          </h4>
          <DataTableWrapper>
            <Table>
              <THead>
                <TR>
                  <TH>{t("preview_source_col")}</TH>
                  <TH>{t("preview_target_col")}</TH>
                  <TH>{t("preview_confidence_col")}</TH>
                  <TH>{t("preview_reason_col")}</TH>
                </TR>
              </THead>
              <TBody>
                {editedMapping.map((m) => (
                  <TR key={m.source_header}>
                    <TD>
                      <code className="font-mono text-sm">{m.source_header}</code>
                    </TD>
                    <TD>
                      <Select
                        value={m.target_field ?? ""}
                        onChange={(e) => updateMapping(m.source_header, e.target.value || null)}
                        aria-label={t("preview_target_aria", { header: m.source_header })}
                        style={{ minWidth: "140px" }}
                      >
                        <option value="">{t("preview_unmapped")}</option>
                        {fieldOptions.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </Select>
                    </TD>
                    <TD
                      className="text-sm"
                      style={{
                        color: m.confidence < 0.7 ? "var(--color-warning)" : "var(--color-text-3)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {(m.confidence * 100).toFixed(0)}%
                    </TD>
                    <TD className="text-3 text-sm">{m.reason ?? ""}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </DataTableWrapper>
        </div>
      </div>

      {preview.preview_rows.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {t("preview_rows_title", { count: preview.preview_rows.length })}
            </span>
          </div>
          <div className="card-body">
            <DataTableWrapper>
              <Table>
                <THead>
                  <TR>
                    {usedTargets.map((target) => (
                      <TH key={target}>{target}</TH>
                    ))}
                  </TR>
                </THead>
                <TBody>
                  {preview.preview_rows.map((row, index) => (
                    <TR key={index}>
                      {usedTargets.map((target) => (
                        <TD key={target} className="text-sm">{row[target] ?? ""}</TD>
                      ))}
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DataTableWrapper>
          </div>
        </div>
      )}

      {hasErrors && (
        <div className="card" style={{ borderColor: "var(--color-error-muted)" }}>
          <div className="card-header">
            <span className="card-title">{t("preview_errors_title")}</span>
          </div>
          <div className="card-body">
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "var(--text-body-sm)",
                color: "var(--color-text-2)",
              }}
            >
              {preview.errors.slice(0, 10).map((e, i) => (
                <li key={i}>
                  <strong>{t("preview_row_label", { n: e.row_index + 1 })}</strong>
                  {e.field ? ` - ${e.field}` : ""}: {e.message}
                </li>
              ))}
              {preview.errors.length > 10 && (
                <li className="text-3">
                  {t("preview_errors_more", { count: preview.errors.length - 10 })}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {props.error && (
        <p className="text-error text-sm" role="alert">
          {props.error}
        </p>
      )}

      <div
        className="card-footer"
        style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}
      >
        <Button
          variant="ghost"
          onClick={props.onBack}
          leadingIcon={<ArrowLeft size={16} aria-hidden />}
        >
          {t("preview_back")}
        </Button>
        <Button
          onClick={props.onConfirm}
          disabled={hasErrors || props.pending}
          loading={props.pending}
          trailingIcon={<ArrowRight size={16} aria-hidden />}
        >
          {props.pending ? t("preview_committing") : t("preview_confirm_cta")}
        </Button>
      </div>
    </div>
  );
}

function DoneStep(props: {
  t: TFn;
  result: CommitResponse | null;
  entityLabel: string;
  onDashboard: () => void;
  onAnother: () => void;
}) {
  const { t, result, entityLabel } = props;
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{t("done_title")}</span>
        <Badge tone="success">
          <Check size={12} aria-hidden /> {t("done_badge")}
        </Badge>
      </div>
      <div className="card-body">
        <p className="text-2" style={{ marginBottom: "var(--space-2)" }}>
          {result
            ? t("done_body", { imported: result.imported, entity: entityLabel.toLowerCase() })
            : t("done_body_fallback")}
        </p>
        <p className="text-3 text-sm">{t("done_note")}</p>
      </div>
      <div
        className="card-footer"
        style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}
      >
        <Button variant="ghost" onClick={props.onAnother}>{t("done_import_another")}</Button>
        <Button onClick={props.onDashboard}>{t("done_go_dashboard")}</Button>
      </div>
    </div>
  );
}
