"use client";

import { RouteErrorPanel } from "@/components/patterns/route-error-panel";

export default function TimesheetsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorPanel {...props} segment="timesheets" />;
}
