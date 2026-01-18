// src/components/admin/mobile-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users2,
  KanbanSquare,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/laporan-admin", label: "Laporan", icon: ClipboardList },
  { href: "/petugas", label: "Petugas", icon: Users2 },
  { href: "/tugas-admin", label: "Tugas", icon: KanbanSquare },
];

export function AdminMobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-4 top-4 z-50 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[84%] p-0">
          <SheetHeader className="px-4 pb-2 pt-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <span className="text-xs font-bold">PPSU</span>
              </div>
              <span className="text-sm">Kelurahan • Admin</span>
            </SheetTitle>
          </SheetHeader>
          <nav
            className="grid gap-1 px-3 pb-4"
            role="navigation"
            aria-label="Sidebar mobile"
          >
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/40"
                  )}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted/40">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
