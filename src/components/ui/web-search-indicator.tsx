"use client";

import { CubeLoader } from "./cube-loader";

export function WebSearchIndicator() {
  return (
    <div className="flex items-center gap-3">
      <CubeLoader size="sm" speed="fast" />
      <span className="text-sm text-primary font-medium">
        Searching the web...
      </span>
    </div>
  );
}
