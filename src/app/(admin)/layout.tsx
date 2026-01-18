import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/adminSidebar";
import { AdminMobileSidebar } from "@/components/admin/adminMobileSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AdminMobileSidebar />
      <div className="mx-auto flex max-w-screen-2xl">
        {/* Sidebar tetap (desktop/tablet) */}
        <AdminSidebar />

        {/* Konten */}
        <main className="min-h-dvh flex-1 px-3 py-4 md:px-6 md:py-6">
          {children}
        </main>
      </div>

      {/* Sidebar versi mobile via Sheet + FAB */}
    </div>
  );
}
