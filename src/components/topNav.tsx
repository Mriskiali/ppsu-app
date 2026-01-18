"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const LINKS = [
  { href: "/", label: "Beranda" },
  // { href: "/tugas", label: "Tugas" },
  { href: "/buat-laporan", label: "Buat Laporan" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/profil", label: "Profil" },
];

export function UserTopNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "hidden md:block" // tampilkan hanya md+
      )}
    >
      <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-6">
        {/* Brand kiri */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <span className="text-xs font-bold">PPSU</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Kelurahan
          </span>
          <Badge variant="secondary" className="ml-2 hidden md:inline">
            User
          </Badge>
        </div>

        {/* Link kanan */}
        <nav className="flex items-center gap-1" aria-label="Navigasi atas">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
