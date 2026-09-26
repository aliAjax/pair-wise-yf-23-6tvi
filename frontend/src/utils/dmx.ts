import type { Fixture } from "../types/Fixture";
import { DMX_MIN_ADDRESS, DMX_UNIVERSE_SIZE } from "../constants/dmx";

export interface DmxRange {
  start: number;
  end: number;
}

export const dmxRangeOf = (fixture: Pick<Fixture, "dmx_address" | "channel_count">): DmxRange => ({
  start: fixture.dmx_address,
  end: fixture.dmx_address + fixture.channel_count - 1
});

export type DmxCheckResult =
  | { ok: true }
  | { ok: false; code: "DMX_ADDRESS_OUT_OF_RANGE" }
  | { ok: false; code: "DMX_ADDRESS_OVERLAP"; conflict: Fixture };

export function checkDmxRange(rows: Fixture[], start: number, channelCount: number, excludeId?: number): DmxCheckResult {
  const end = start + channelCount - 1;
  if (!Number.isInteger(start) || !Number.isInteger(channelCount) || channelCount < 1 || start < DMX_MIN_ADDRESS || end > DMX_UNIVERSE_SIZE) {
    return { ok: false, code: "DMX_ADDRESS_OUT_OF_RANGE" };
  }
  const conflict = rows.find((row) => {
    if (row.id === excludeId) return false;
    const range = dmxRangeOf(row);
    return range.start <= end && start <= range.end;
  });
  return conflict ? { ok: false, code: "DMX_ADDRESS_OVERLAP", conflict } : { ok: true };
}

export const occupiedChannels = (rows: Fixture[]) => rows.reduce((sum, row) => sum + row.channel_count, 0);

export const formatDmxRange = (fixture: Pick<Fixture, "dmx_address" | "channel_count">) => {
  const range = dmxRangeOf(fixture);
  const pad = (value: number) => String(value).padStart(3, "0");
  return `${pad(range.start)}–${pad(range.end)}`;
};
