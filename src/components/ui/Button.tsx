import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center justify-center rounded-xl px-7 py-4 text-[16px] font-semibold transition duration-300",
        variant === "primary" &&
          "bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] text-[#07090b] shadow-[inset_0_1px_0_rgba(255,255,255,.34),0_22px_60px_rgba(201,132,106,.24)] hover:-translate-y-0.5",
        variant === "secondary" &&
          "border border-[#e2b09a]/24 bg-white/[.035] text-white backdrop-blur-xl hover:-translate-y-0.5 hover:border-[#8b5cf6]/50 hover:bg-white/[.06]",
        variant === "dark" &&
          "bg-[#07090B] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)] hover:-translate-y-0.5 hover:shadow-[0_20px_70px_rgba(0,0,0,.2)]"
      )}
    >
      {children}
      <ArrowRight className="ml-3 h-4 w-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
