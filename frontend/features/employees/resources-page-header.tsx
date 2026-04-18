"use client";

import { useTranslations } from "next-intl";

import {
  TimelineWindowSelector,
  type WindowPresetValue,
} from "@/components/patterns/timeline-window-selector";

type Props = {
  windowValue: WindowPresetValue;
  onWindowChange: (v: WindowPresetValue) => void;
  overline?: string;
  title?: string;
};

export function ResourcesPageHeader({
  windowValue,
  onWindowChange,
  overline,
  title,
}: Props) {
  const t = useTranslations("employees");

  return (
    <section className="resources-page-header">
      <div className="resources-page-header-title-group">
        <span className="resources-page-header-overline">
          {overline ?? t("resources_overline")}
        </span>
        <h1 className="resources-page-header-title">
          {title ?? t("resources_title")}
        </h1>
      </div>

      <div className="resources-page-header-controls">
        <TimelineWindowSelector
          value={windowValue}
          onChange={onWindowChange}
          label={t("window_label")}
        />
      </div>
    </section>
  );
}
