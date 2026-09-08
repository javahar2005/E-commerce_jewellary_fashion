import { cn } from "@/lib/utils";
import { ButtonLink } from "./Button";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden
    />
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-stone">
      <Spinner className="h-5 w-5" />
      <p className="eyebrow">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center border border-dashed border-charcoal/15 bg-white/50 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-stone">{icon}</div>}
      <h3 className="font-serif text-xl text-charcoal">{title}</h3>
      {description && <p className="mt-2 text-sm text-stone">{description}</p>}
      {actionHref && actionLabel && (
        <ButtonLink href={actionHref} variant="outline" size="sm" className="mt-6">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  retry,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center border border-[#b4796a]/40 bg-white px-6 py-12 text-center">
      <h3 className="font-serif text-xl">{title}</h3>
      {description && <p className="mt-2 text-sm text-stone">{description}</p>}
      {retry && (
        <button
          onClick={retry}
          className="mt-5 border border-charcoal/30 px-4 py-2 text-xs tracking-wide hover:bg-beige"
        >
          Try again
        </button>
      )}
    </div>
  );
}
