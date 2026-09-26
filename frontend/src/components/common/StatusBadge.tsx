export function StatusBadge({ value, className = "" }: { value: string; className?: string }) {
  const slug = String(value).toLowerCase().replace(/_/g, "-");
  return <span className={`badge ${slug} ${className}`.trim()}>{String(value).replace(/_/g, " ")}</span>;
}
