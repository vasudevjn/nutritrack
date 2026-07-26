"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Home,
  Leaf,
  MoreHorizontal,
  Scale,
  Settings,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/log", label: "Log", icon: UtensilsCrossed },
  { href: "/history", label: "History", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const moreNav = [
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMoreActive = moreNav.some((n) => pathname.startsWith(n.href));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 px-4 py-6 backdrop-blur-md md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-heading text-xl tracking-tight">NutriTrack</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {[...primaryNav, ...moreNav].map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-2">
          {primaryNav.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="relative">
            <details className="group">
              <summary
                className={cn(
                  "flex cursor-pointer list-none flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px]",
                  isMoreActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <MoreHorizontal className="size-5" />
                More
              </summary>
              <div className="absolute bottom-14 right-0 w-40 rounded-xl border border-border bg-card p-2 shadow-lg">
                {moreNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          </li>
        </ul>
      </nav>
    </div>
  );
}
