"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const convex = useMemo(() => {
    // Get the URL, with a fallback for build time
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;

    // During build/SSR, use a placeholder URL that won't actually be used
    // At runtime in the browser, the real URL will be available
    if (typeof window === "undefined") {
      // Server-side: use a dummy URL to satisfy the constructor
      return new ConvexReactClient("https://placeholder.convex.cloud");
    }

    // Client-side: use the actual URL
    return new ConvexReactClient(url!);
  }, []);

  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
