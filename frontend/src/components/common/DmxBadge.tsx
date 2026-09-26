import type { Fixture } from "../../types/Fixture";
import { formatDmxRange } from "../../utils/dmx";

export function DmxBadge({ fixture }: { fixture: Pick<Fixture, "dmx_address" | "channel_count"> }) {
  return <span className="badge dmx">{formatDmxRange(fixture)}</span>;
}
