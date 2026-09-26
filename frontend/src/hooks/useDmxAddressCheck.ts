import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";
import { checkDmxRange, dmxRangeOf, occupiedChannels, type DmxCheckResult } from "../utils/dmx";
import { DMX_UNIVERSE_SIZE } from "../constants/dmx";

export function useDmxAddressCheck(rows: Fixture[] = []) {
  const segments = useMemo(
    () => rows.map((fixture) => ({ fixture, range: dmxRangeOf(fixture) })),
    [rows]
  );
  const occupied = useMemo(() => occupiedChannels(rows), [rows]);
  const check = (start: number, channelCount: number, excludeId?: number): DmxCheckResult =>
    checkDmxRange(rows, start, channelCount, excludeId);
  return {
    segments,
    occupied,
    free: DMX_UNIVERSE_SIZE - occupied,
    check
  };
}
