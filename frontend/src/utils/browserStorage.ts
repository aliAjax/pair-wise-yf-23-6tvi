const PREFIX = "stage-light:";

export function loadRows<T>(key: string, seed: T[]): T[] {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // Storage blocked or corrupted: fall back to the bundled seed rows.
  }
  const rows = seed.map((row) => ({ ...row }));
  saveRows(key, rows);
  return rows;
}

export function saveRows<T>(key: string, rows: T[]) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(rows));
  } catch {
    // Storage full or unavailable: keep the in-memory state authoritative.
  }
}
