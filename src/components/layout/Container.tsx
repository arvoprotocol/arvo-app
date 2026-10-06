import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-[min(1440px,calc(100%-64px))]", className)}>
      {children}
    </div>
  );
}
