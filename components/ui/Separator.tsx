import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-[#2A2D36] shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#1F232C]", className)}
      aria-hidden="true"
    />
  );
}
