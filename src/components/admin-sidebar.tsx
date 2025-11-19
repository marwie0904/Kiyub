"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Bug,
  Lightbulb,
  Flag,
  ChevronDown,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/providers/theme-provider";

const navigationItems = [
  { icon: BarChart3, label: "LLM Analytics", href: "/admin/llm-analytics" },
  { icon: Flag, label: "Flagged Responses", href: "/admin/flagged-responses" },
  { icon: Bug, label: "Bug Reports", href: "/admin/bug-reports" },
  { icon: Lightbulb, label: "Feature Requests", href: "/admin/feature-requests" },
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  if (isCollapsed) {
    return (
      <div className="flex h-screen w-[60px] flex-col bg-sidebar-secondary items-center py-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/5 mb-6"
          onClick={onToggleCollapse}
        >
          <PanelLeftOpen className="h-5 w-5 text-foreground" />
        </Button>

        <nav className="space-y-2 flex-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 hover:bg-black/10 dark:hover:bg-white/5",
                    isActive && "bg-black/10 dark:bg-white/10"
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5 text-sidebar-text" />
                </Button>
              </Link>
            );
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-black/10 dark:hover:bg-white/5 mb-2"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            MW
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-[280px] flex-col bg-sidebar-secondary">
      {/* App Name */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/5"
            onClick={onToggleCollapse}
          >
            <PanelLeftClose className="h-5 w-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-merriweather)] text-foreground">
              Freire
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-2 mt-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="block"
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 hover:bg-black/10 dark:hover:bg-white/5 text-sidebar-text",
                  isActive && "bg-black/10 dark:bg-white/10"
                )}
                size="sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* User Profile */}
      <div className="p-4 space-y-2">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-sidebar-text">Theme</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/5">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 hover:bg-black/10 dark:hover:bg-white/5"
              size="lg"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  MW
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-medium text-sidebar-text">Mar Wie Ang</span>
                <span className="text-xs text-sidebar-text opacity-70">Admin</span>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-text" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
