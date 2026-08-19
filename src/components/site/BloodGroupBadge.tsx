import { cn } from "@/lib/utils";

export function BloodGroupBadge({ group, className }: { group: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-display font-bold rounded-xl bg-gradient-primary text-primary-foreground shadow-glow",
        "h-12 w-12 text-base",
        className,
      )}
    >
      {group}
    </span>
  );
}
