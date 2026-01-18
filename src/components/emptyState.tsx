"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  ctaLabel,
  onCta,
  className,
}: {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("border-dashed border-border/60 bg-card", className)}>
      <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
        {/* Icon placeholder */}
        <div
          role="img"
          aria-label="Ilustrasi kosong"
          className="mb-1 size-14 rounded-2xl border border-dashed border-border/60 bg-muted/40"
        />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="max-w-xs text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
        {ctaLabel ? (
          <Button onClick={onCta} size="sm" className="mt-1 rounded-xl">
            {ctaLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
