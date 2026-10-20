export function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`text-accent ${className}`} role="img" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(Math.floor(value))}{value % 1 ? "⯪" : ""}<span className="text-slate-300">{"★".repeat(5 - Math.ceil(value))}</span>
    </span>
  );
}
