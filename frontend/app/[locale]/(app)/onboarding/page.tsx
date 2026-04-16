"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Upload, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  DataTableWrapper,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/ui/table";
import {
  usePreviewCsv,
  type EntityType,
  type PreviewResponse,
} from "@/features/onboarding/use-preview";

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Upload" },
  { id: 3, label: "Preview" },
  { id: 4, label: "Done" },
];

const ENTITY_LABELS: Record<EntityType, string> = {
  employees: "Employees",
  clients: "Clients",
  projects: "Projects",
  teams: "Teams",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [entityType, setEntityType] = useState<EntityType>("employees");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const previewMutation = usePreviewCsv();

  async function runPreview() {
    if (!file) return;
    try {
      const result = await previewMutation.mutateAsync({ file, entityType });
      setPreview(result);
      setStep(3);
    } catch {
      // surfaced via previewMutation.error
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "var(--text-display-lg)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-text-1)",
            marginBottom: "var(--space-1)",
          }}
        >
          Onboard your company
        </h1>
        <p className="text-2">
          Drop your CSV, confirm the AI column mapping, and we load your
          employees, clients, and projects. The app does the work. You confirm.
        </p>
      </div>

      <Stepper current={step} />

      {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}

      {step === 2 && (
        <UploadStep
          entityType={entityType}
          onEntityChange={setEntityType}
          file={file}
          onFileChange={setFile}
          onBack={() => setStep(1)}
          onPreview={runPreview}
          pending={previewMutation.isPending}
          error={previewMutation.error as Error | null}
        />
      )}

      {step === 3 && preview && (
        <PreviewStep
          preview={preview}
          onBack={() => setStep(2)}
          onConfirm={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <DoneStep
          preview={preview}
          onDashboard={() => router.push("/dashboard")}
          onAnother={() => {
            setStep(1);
            setFile(null);
            setPreview(null);
          }}
        />
      )}
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  return (
    <div className="card">
      <div className="card-body">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          {STEPS.map((s, idx) => {
            const done = s.id < current;
            const active = s.id === current;
            const dotBg = done
              ? "var(--color-success)"
              : active
                ? "var(--color-primary)"
                : "var(--color-surface-2)";
            const dotColor = done || active
              ? "var(--color-text-inv)"
              : "var(--color-text-3)";
            const labelColor = active
              ? "var(--color-text-1)"
              : "var(--color-text-3)";

            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  <div
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
                    {done ? <Check size={14} aria-hidden /> : s.id}
                  </div>
                  <span
                    style={{
                      fontSize: "var(--text-body-sm)",
                      fontWeight: active
                        ? "var(--weight-semibold)"
                        : "var(--weight-regular)",
                      color: labelColor,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
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

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Welcome to Gamma</span>
        <Badge tone="accent">
          <Sparkles size={12} aria-hidden /> AI column mapper
        </Badge>
      </div>
      <div className="card-body">
        <p className="text-2" style={{ marginBottom: "var(--space-4)" }}>
          In the next three steps you will upload a CSV for each entity
          (employees, clients, projects), the AI maps your columns to Gamma
          fields, you review the preview, and we load everything into your
          tenant.
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
            {
              n: 1,
              title: "Drop a CSV",
              body: "Any header naming works. Canonical demo fixtures live at backend/fixtures/demo/*.csv if you want to try it first.",
            },
            {
              n: 2,
              title: "Confirm the mapping",
              body: "Our AI picks the target field for each column. You review and adjust before committing.",
            },
            {
              n: 3,
              title: "Go live",
              body: "Rows land in your tenant. The dashboard lights up. You repeat for the next entity.",
            },
          ].map((item) => (
            <li
              key={item.n}
              style={{
                display: "flex",
                gap: "var(--space-3)",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-primary-muted)",
                  color: "var(--color-primary)",
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
        <Button
          onClick={onNext}
          trailingIcon={<ArrowRight size={16} aria-hidden />}
        >
          Get started
        </Button>
      </div>
    </div>
  );
}

function UploadStep(props: {
  entityType: EntityType;
  onEntityChange: (value: EntityType) => void;
  file: File | null;
  onFileChange: (value: File | null) => void;
  onBack: () => void;
  onPreview: () => void;
  pending: boolean;
  error: Error | null;
}) {
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

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Upload a CSV</span>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label" htmlFor="entity-type">
            Entity type
          </label>
          <Select
            id="entity-type"
            value={props.entityType}
            onChange={(event) =>
              props.onEntityChange(event.target.value as EntityType)
            }
          >
            {(Object.keys(ENTITY_LABELS) as EntityType[]).map((key) => (
              <option key={key} value={key}>
                {ENTITY_LABELS[key]}
              </option>
            ))}
          </Select>
        </div>

        <div className="form-group">
          <label className="form-label">CSV file</label>
          <div
            className={`upload-zone ${dragActive ? "dragover" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
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
              {props.file ? props.file.name : "Drop CSV here or click to browse"}
            </div>
            <div className="text-3 text-caption">
              Any header naming works. Max 10,000 rows per file.
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleSelect}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {props.error && (
          <p className="text-error text-sm" style={{ marginTop: "var(--space-2)" }}>
            {props.error.message}
          </p>
        )}
      </div>
      <div
        className="card-footer"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Button
          variant="ghost"
          onClick={props.onBack}
          leadingIcon={<ArrowLeft size={16} aria-hidden />}
        >
          Back
        </Button>
        <Button
          onClick={props.onPreview}
          disabled={!props.file || props.pending}
          loading={props.pending}
          trailingIcon={<ArrowRight size={16} aria-hidden />}
        >
          Preview
        </Button>
      </div>
    </div>
  );
}

function PreviewStep(props: {
  preview: PreviewResponse;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { preview } = props;
  const hasErrors = preview.errors.length > 0;
  const usedTargets = preview.mapping
    .map((m) => m.target_field)
    .filter((t): t is string => t !== null);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      <div className="card">
        <div className="card-header">
          <span className="card-title">Preview</span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Badge tone="info">{preview.row_count} rows</Badge>
            <Badge tone={hasErrors ? "error" : "success"}>
              {hasErrors
                ? `${preview.errors.length} issue${preview.errors.length === 1 ? "" : "s"}`
                : "clean"}
            </Badge>
          </div>
        </div>
        <div className="card-body">
          <p className="text-2 text-sm" style={{ marginBottom: "var(--space-4)" }}>
            {usedTargets.length} of {preview.mapping.length} columns matched to
            target fields. Review the mapping and the first few rows below
            before committing.
          </p>

          <h4
            style={{
              fontSize: "var(--text-overline)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "var(--space-2)",
            }}
          >
            Column mapping
          </h4>
          <DataTableWrapper>
            <Table>
              <THead>
                <TR>
                  <TH>Source header</TH>
                  <TH>Target field</TH>
                  <TH>Confidence</TH>
                  <TH>Reason</TH>
                </TR>
              </THead>
              <TBody>
                {preview.mapping.map((m) => (
                  <TR key={m.source_header}>
                    <TD>
                      <code className="font-mono text-sm">{m.source_header}</code>
                    </TD>
                    <TD>
                      {m.target_field ? (
                        <Badge tone="primary">{m.target_field}</Badge>
                      ) : (
                        <Badge tone="neutral">unmapped</Badge>
                      )}
                    </TD>
                    <TD className="text-3 text-sm">
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
              First {preview.preview_rows.length} rows
            </span>
          </div>
          <div className="card-body">
            <DataTableWrapper>
              <Table>
                <THead>
                  <TR>
                    {usedTargets.map((t) => (
                      <TH key={t}>{t}</TH>
                    ))}
                  </TR>
                </THead>
                <TBody>
                  {preview.preview_rows.map((row, index) => (
                    <TR key={index}>
                      {usedTargets.map((t) => (
                        <TD key={t} className="text-sm">
                          {row[t] ?? ""}
                        </TD>
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
            <span className="card-title">Validation errors</span>
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
                  <strong>Row {e.row_index + 1}</strong>
                  {e.field ? ` - ${e.field}` : ""}: {e.message}
                </li>
              ))}
              {preview.errors.length > 10 && (
                <li className="text-3">
                  ... {preview.errors.length - 10} more
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="ghost"
          onClick={props.onBack}
          leadingIcon={<ArrowLeft size={16} aria-hidden />}
        >
          Back
        </Button>
        <Button
          onClick={props.onConfirm}
          disabled={hasErrors}
          trailingIcon={<ArrowRight size={16} aria-hidden />}
        >
          Confirm and import
        </Button>
      </div>
    </div>
  );
}

function DoneStep(props: {
  preview: PreviewResponse | null;
  onDashboard: () => void;
  onAnother: () => void;
}) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Import queued</span>
        <Badge tone="success">
          <Check size={12} aria-hidden /> ready
        </Badge>
      </div>
      <div className="card-body">
        <p className="text-2" style={{ marginBottom: "var(--space-2)" }}>
          {props.preview
            ? `Queued ${props.preview.row_count} ${props.preview.entity_type} rows for import.`
            : "Your data is on its way."}
        </p>
        <p className="text-3 text-sm">
          The backend validates the rows again against your tenant schema, then
          inserts in a single transaction. You will see the new counts on the
          dashboard as soon as the job finishes.
        </p>
      </div>
      <div
        className="card-footer"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Button variant="ghost" onClick={props.onAnother}>
          Import another file
        </Button>
        <Button onClick={props.onDashboard}>Go to dashboard</Button>
      </div>
    </div>
  );
}
