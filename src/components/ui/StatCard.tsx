export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-charcoal/10 bg-white p-5">
      <p className="text-[0.7rem] uppercase tracking-[0.14em] text-stone">{label}</p>
      <p className="mt-2 font-serif text-3xl text-charcoal">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone">{hint}</p>}
    </div>
  );
}
