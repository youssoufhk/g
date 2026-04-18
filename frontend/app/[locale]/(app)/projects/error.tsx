"use client";

import { RouteErrorPanel } from "@/components/patterns/route-error-panel";

export default function ProjectsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorPanel {...props} segment="projects" />;
}
