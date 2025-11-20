"use client";

import { AuthGuard } from "./auth-guard";
import { UserMenu } from "./user-menu";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  showUserMenu?: boolean;
}

export function ProtectedLayout({ children, showUserMenu = true }: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      {showUserMenu && (
        <div className="absolute right-4 top-4 z-50">
          <UserMenu />
        </div>
      )}
      {children}
    </AuthGuard>
  );
}
