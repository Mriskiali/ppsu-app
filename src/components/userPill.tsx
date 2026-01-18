"use client";

import { USERS } from "@/lib/mock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  id: string; // petugas.id
  className?: string;
  showId?: boolean; // tampilkan petugasId di samping nama
  size?: "sm" | "md"; // ukuran pill
};

export function UserPill({
  id,
  className,
  showId = false,
  size = "md",
}: Props) {
  const user = USERS.find((p) => p.id === id);

  const initials = user?.nama
    ? user.nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const sizes = {
    sm: {
      pill: "px-2 py-0.5 text-[11px]",
      avatar: "size-5 text-[9px]",
      name: "max-w-[80px]",
    },
    md: {
      pill: "px-2.5 py-1 text-xs",
      avatar: "size-6 text-[10px]",
      name: "max-w-[110px]",
    },
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card",
        sizes.pill,
        className
      )}
      title={
        user ? `${user.nama}${showId ? ` • ${user.petugasId}` : ""}` : "Petugas"
      }
    >
      <Avatar className={cn(sizes.avatar, "rounded-full")}>
        <AvatarFallback className="rounded-full bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn("truncate font-medium text-foreground/80", sizes.name)}
      >
        {user?.nama ?? "Petugas"}
      </span>
      {showId && user?.petugasId ? (
        <span className="hidden sm:inline text-muted-foreground">
          • {user.petugasId}
        </span>
      ) : null}
    </div>
  );
}
