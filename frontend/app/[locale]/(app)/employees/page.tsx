"use client";

import { ResourcesView } from "@/features/employees/resources-view";

export default function EmployeesPage() {
  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <ResourcesView />
    </>
  );
}
