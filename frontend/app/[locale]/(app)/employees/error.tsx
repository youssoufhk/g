"use client";

import { RouteErrorPanel } from "@/components/patterns/route-error-panel";

export default function EmployeesError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorPanel {...props} segment="employees" />;
}
