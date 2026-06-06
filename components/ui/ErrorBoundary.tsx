"use client";

import React from "react";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">
          <div className="max-w-md border-4 border-black p-8 text-center">
            <h2 className="mb-4 text-2xl font-black">Something went wrong</h2>
            <p className="mb-6 text-gray-600">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="border-4 border-black bg-black px-6 py-3 font-bold text-white transition-colors hover:bg-[#00E5FF] hover:text-black"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
