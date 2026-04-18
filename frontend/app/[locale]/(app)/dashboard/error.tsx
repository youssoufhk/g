"use client";

import { RouteErrorPanel } from "@/components/patterns/route-error-panel";

export default function DashboardError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorPanel {...props} segment="dashboard" />;
}
