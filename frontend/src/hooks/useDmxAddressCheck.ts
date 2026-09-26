import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";

export const DMX_UNIVERSE_SIZE = 512;

export interface DmxRange {
  start: number;
  end: number;
}

export interface DmxCandidate {
  id?: number;
  dmx_address: string;
  channel_count: number;
}

export type DmxCheckResult =
  | { ok: true; range: DmxRange }
  | { ok: false; reason: "INVALID" | "OUT_OF_RANGE" | "OVERLAP"; range?: DmxRange; conflict?: Fixture };

/** 灯具占用的地址段：[起始地址, 起始地址 + 通道数 - 1] */
export function fixtureRange(fixture: Pick<Fixture, "dmx_address" | "channel_count">): DmxRange {
  const start = Number(fixture.dmx_address);
  const count = Number(fixture.channel_count);
  return { start, end: start + count - 1 };
}

/** 校验候选地址段：越界不过 512，重叠时返回撞上的那盏灯。 */
export function checkDmxRange(rows: Fixture[], candidate: DmxCandidate): DmxCheckResult {
  const start = Number(candidate.dmx_address);
  const count = Number(candidate.channel_count);
  if (!Number.isInteger(start) || start < 1 || !Number.isInteger(count) || count < 1) {
    return { ok: false, reason: "INVALID" };
  }
  const range: DmxRange = { start, end: start + count - 1 };
  if (range.end > DMX_UNIVERSE_SIZE) {
    return { ok: false, reason: "OUT_OF_RANGE", range };
  }
  const conflict = rows.find((row) => {
    if (candidate.id != null && row.id === candidate.id) return false;
    const other = fixtureRange(row);
    return range.start <= other.end && other.start <= range.end;
  });
  if (conflict) {
    return { ok: false, reason: "OVERLAP", range, conflict };
  }
  return { ok: true, range };
}

export function useDmxAddressCheck(rows: Fixture[]) {
  return useMemo(() => (candidate: DmxCandidate) => checkDmxRange(rows, candidate), [rows]);
}
