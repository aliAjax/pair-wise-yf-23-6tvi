import type { Fixture } from "../types/Fixture";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 0,
  fixture_code: "",
  fixture_type: "PAR",
  position_x: "",
  position_y: "",
  dmx_address: "",
  channel_count: 3,
  color_mode: "RGB",
  ...overrides
});

export const createFixtureForm = createDefaultFixture;
export const createFixtureResponse = createDefaultFixture;
