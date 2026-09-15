import { Link, useRouterState } from "@tanstack/react-router";
import { Dumbbell, LineChart, Settings, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/pt", label: "Training", short: "Training", icon: Dumbbell },
  { to: "/body", label: "Body Measurements", short: "Body", icon: LineChart },
  { to: "/meals", label: "Meals", short: "Meals", icon: UtensilsCrossed },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[17rem] flex-col border-r border-border bg-sidebar px-5 py-4 lg:flex">
        <div className="px-2">
          <p className="text-sm font-semibold leading-tight text-brand">Character Development</p>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-lavender-faint hover:text-foreground",
                )}
              >
                <item.icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-lavender-faint hover:text-foreground",
          )}
        >
          <Settings className="size-[18px] shrink-0" />
          Settings
        </Link>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-1.5 backdrop-blur lg:hidden">
        <p className="truncate text-[18px] font-semibold leading-none tracking-tight text-brand sm:text-[20px]">
          Character Development&nbsp;
        </p>
        <Button asChild variant="ghost" size="iconSm" aria-label="Settings" className="text-brand hover:text-brand/80">
          <Link to="/settings">
            <Settings />
          </Link>
        </Button>
      </header>

      <main className="lg:pl-56">
        <div className="mx-auto w-full max-w-[1400px] px-3.5 pb-24 pt-3.5 sm:px-5 lg:px-8 lg:pb-8 lg:pt-5">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-card/95 pt-1 backdrop-blur lg:hidden">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "mx-2 flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors",
                active ? "bg-lavender-soft text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-[18px]" />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
