import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans text-sm tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory rounded-[3px]";

const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-ivory hover:bg-[#3d3b35]",
  secondary: "bg-beige text-charcoal hover:bg-beige-deep",
  outline: "border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-beige/50",
  ghost: "text-charcoal hover:bg-beige/60",
  danger: "border border-[#b4796a] text-[#8f5748] hover:bg-[#b4796a]/10",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-11 px-6",
  lg: "h-12 px-8 text-[0.9rem]",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
