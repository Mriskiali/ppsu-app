"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, FilePlus2, History, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS: Item[] = [
  { href: "/", label: "Beranda", hrefLabel: "Beranda", icon: Home },
  { href: "/buat-laporan", label: "Laporan", icon: FilePlus2 },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/profil", label: "Profil", icon: User2 },
];

export function UserBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
        "md:hidden"
      )}
      role="navigation"
      aria-label="Navigasi bawah"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 select-none flex-col items-center gap-1 rounded-lg p-2 text-[10px] font-medium transition",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-md",
                  active ? "bg-primary/10" : "bg-muted/40"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
