"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";
import {
  usePreviewCsv,
  type EntityType,
  type PreviewResponse,
} from "@/features/onboarding/use-preview";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: "Welcome",
  2: "Upload a CSV",
  3: "Preview + mapping",
  4: "Done",
};

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

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  }

  async function runPreview() {
    if (!file) return;
    try {
      const result = await previewMutation.mutateAsync({ file, entityType });
      setPreview(result);
      setStep(3);
    } catch {
      // error surfaced via previewMutation.error below
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
      <OnboardingProgress step={step} />

      {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}

      {step === 2 && (
        <UploadStep
          entityType={entityType}
          onEntityChange={setEntityType}
          file={file}
          onFileChange={onFileChange}
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

function OnboardingProgress({ step }: { step: Step }) {
  return (
    <Card padded>
      <div className="flex items-center justify-between gap-2">
        {(Object.keys(STEP_LABELS) as unknown as Step[]).map((k) => {
          const active = k === step;
          const done = k < step;
          return (
            <div key={k} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                  done
                    ? "bg-[var(--color-success)] text-[var(--color-text-inv)]"
                    : active
                      ? "bg-[var(--color-primary)] text-[var(--color-text-inv)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-3)]"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : k}
              </div>
              <span
                className={`text-[11px] ${
                  active
                    ? "text-[var(--color-text-1)]"
                    : "text-[var(--color-text-3)]"
                }`}
              >
                {STEP_LABELS[k]}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card padded>
      <CardHeader>
        <div>
          <CardTitle>Welcome to Gamma onboarding</CardTitle>
          <CardDescription>
            We will upload your employees, clients, and projects from CSV, have
            the AI column mapper match the columns, validate the rows, and show
            you a preview before anything touches the database.
          </CardDescription>
        </div>
      </CardHeader>
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
        >
          Get started
        </Button>
      </div>
    </Card>
  );
}

function UploadStep(props: {
  entityType: EntityType;
  onEntityChange: (value: EntityType) => void;
  file: File | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onPreview: () => void;
  pending: boolean;
  error: Error | null;
}) {
  return (
    <Card padded>
      <CardHeader>
        <div>
          <CardTitle>Upload a CSV</CardTitle>
          <CardDescription>
            Pick the entity you are importing, then select a .csv file from
            your computer. The canonical demo fixtures live at
            backend/fixtures/demo/*.csv if you do not have your own yet.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-[var(--color-text-2)] mb-1">
            Entity type
          </span>
          <Select
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
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-[var(--color-text-2)] mb-1">
            CSV file
          </span>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={props.onFileChange}
              className="text-sm text-[var(--color-text-2)] file:mr-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-md)] file:border file:border-[var(--color-border)] file:bg-[var(--color-surface-2)] file:text-[var(--color-text-1)] file:text-sm file:cursor-pointer"
            />
            {props.file && (
              <Badge tone="primary">{props.file.name}</Badge>
            )}
          </div>
        </label>

        {props.error && (
          <p className="text-xs text-[var(--color-error)]">
            {props.error.message}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-between gap-2">
        <Button
          variant="tertiary"
          onClick={props.onBack}
          leadingIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
        >
          Back
        </Button>
        <Button
          onClick={props.onPreview}
          disabled={!props.file || props.pending}
          loading={props.pending}
          leadingIcon={<Upload className="h-4 w-4" aria-hidden />}
        >
          Preview
        </Button>
      </div>
    </Card>
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
    <div className="space-y-4">
      <Card padded>
        <CardHeader>
          <div>
            <CardTitle>Preview ({preview.row_count} rows)</CardTitle>
            <CardDescription>
              {usedTargets.length} of {preview.mapping.length} columns matched
              to target fields.{" "}
              {hasErrors
                ? `${preview.errors.length} validation issue(s) found.`
                : "No validation issues."}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-3)] mb-2">
            Column mapping
          </h4>
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
                  <TD className="font-mono text-xs">{m.source_header}</TD>
                  <TD>
                    {m.target_field ? (
                      <Badge tone="primary">{m.target_field}</Badge>
                    ) : (
                      <Badge tone="neutral">unmapped</Badge>
                    )}
                  </TD>
                  <TD className="text-xs text-[var(--color-text-3)]">
                    {(m.confidence * 100).toFixed(0)}%
                  </TD>
                  <TD className="text-xs text-[var(--color-text-3)]">
                    {m.reason ?? ""}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        {preview.preview_rows.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-3)] mb-2">
              First {preview.preview_rows.length} rows
            </h4>
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
                      <TD
                        key={t}
                        className="text-xs text-[var(--color-text-2)] max-w-[12rem] truncate"
                      >
                        {row[t] ?? ""}
                      </TD>
                    ))}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}

        {hasErrors && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-error)] mb-2">
              Validation errors
            </h4>
            <ul className="text-xs space-y-1 text-[var(--color-text-2)]">
              {preview.errors.slice(0, 10).map((e, i) => (
                <li key={i}>
                  Row {e.row_index + 1}
                  {e.field ? ` - ${e.field}` : ""}: {e.message}
                </li>
              ))}
              {preview.errors.length > 10 && (
                <li className="text-[var(--color-text-3)]">
                  ... {preview.errors.length - 10} more
                </li>
              )}
            </ul>
          </div>
        )}
      </Card>

      <div className="flex justify-between gap-2">
        <Button
          variant="tertiary"
          onClick={props.onBack}
          leadingIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
        >
          Back
        </Button>
        <Button
          onClick={props.onConfirm}
          disabled={hasErrors}
          trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
        >
          Confirm
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
    <Card padded>
      <CardHeader>
        <div>
          <CardTitle>Import queued</CardTitle>
          <CardDescription>
            Phase 3a validates and previews the data. The actual insert into
            your tenant tables lands in Phase 4, at which point this screen
            becomes a real progress stream.
          </CardDescription>
        </div>
      </CardHeader>

      {props.preview && (
        <p className="text-sm text-[var(--color-text-2)] mb-4">
          Ready to import {props.preview.row_count} {props.preview.entity_type} rows.
        </p>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="tertiary" onClick={props.onAnother}>
          Import another file
        </Button>
        <Button onClick={props.onDashboard}>Go to dashboard</Button>
      </div>
    </Card>
  );
}
