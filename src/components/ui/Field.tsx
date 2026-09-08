import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-[3px] border border-charcoal/20 bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-stone/60 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal/20 transition-colors";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium tracking-wide text-charcoal", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-[#8f5748]">{children}</p>;
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-stone">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(control, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(control, "min-h-[110px] resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(control, "appearance-none pr-8", className)} {...props} />
));
Select.displayName = "Select";
