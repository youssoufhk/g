"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { EmptyState } from "./empty-state";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <EmptyState
            icon={AlertCircle}
            title="Something went wrong"
            description={this.state.error.message}
          />
        )
      );
    }
    return this.props.children;
  }
}
