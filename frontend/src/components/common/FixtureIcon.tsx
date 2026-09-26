import { StatusBadge } from "./StatusBadge";

export function FixtureIcon({ title = "FixtureIcon", value }: { title?: string; value?: string }) {
  return (
    <span className="fixture-icon">
      <span className="fixture-dot" aria-hidden="true" />
      <strong>{title}</strong>
      {value ? <StatusBadge value={value} /> : null}
    </span>
  );
}
