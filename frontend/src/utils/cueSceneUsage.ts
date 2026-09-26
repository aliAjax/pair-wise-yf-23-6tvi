import type { CueScene } from "../types/CueScene";

export function parseFixtureStateIds(raw: string): number[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((state) => Number((state as { fixture_id?: unknown })?.fixture_id))
      .filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

export function collectFixtureUsage(scenes: CueScene[]): Map<number, string[]> {
  const usage = new Map<number, string[]>();
  for (const scene of scenes) {
    for (const fixtureId of parseFixtureStateIds(scene.fixture_states)) {
      usage.set(fixtureId, [...(usage.get(fixtureId) ?? []), scene.name]);
    }
  }
  return usage;
}
