"use client";

import { AuthGuard } from "./auth-guard";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
