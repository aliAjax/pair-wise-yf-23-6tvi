import type { Fixture } from "../../types/Fixture";
import { dmxRangeOf } from "../../utils/dmx";
import { DMX_UNIVERSE_SIZE } from "../../constants/dmx";

export function DmxOccupancyBar({ fixtures, highlightId = null }: { fixtures: Fixture[]; highlightId?: number | null }) {
  return (
    <div className="dmx-bar" role="img" aria-label={`DMX 地址占用（共 ${DMX_UNIVERSE_SIZE} 通道）`}>
      {fixtures.map((fixture) => {
        const range = dmxRangeOf(fixture);
        const left = ((range.start - 1) / DMX_UNIVERSE_SIZE) * 100;
        const width = ((range.end - range.start + 1) / DMX_UNIVERSE_SIZE) * 100;
        return (
          <span
            key={fixture.id}
            className={"dmx-seg" + (highlightId === fixture.id ? " active" : "")}
            style={{ left: `${left}%`, width: `${width}%` }}
            title={`${fixture.fixture_code} 占用 ${range.start}–${range.end}`}
          />
        );
      })}
    </div>
  );
}
