import { mockData } from "../mocks/seedData";
import type { Fixture } from "../types/Fixture";
import { loadRows, saveRows } from "../utils/browserStorage";
import { checkDmxRange, formatDmxRange } from "../utils/dmx";
import { collectFixtureUsage } from "../utils/cueSceneUsage";
import { ERROR_MESSAGES, dmxOverlapMessage, fixtureInUseMessage } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { listCueScene } from "./CueScene";

const STORAGE_KEY = "fixture";

export async function listFixture(): Promise<Fixture[]> {
  return loadRows<Fixture>(STORAGE_KEY, mockData.fixture as unknown as Fixture[]);
}

export async function saveFixture(payload: Fixture): Promise<Fixture> {
  const rows = await listFixture();
  const check = checkDmxRange(rows, payload.dmx_address, payload.channel_count, payload.id);
  if (!check.ok) {
    const message = check.code === "DMX_ADDRESS_OVERLAP"
      ? dmxOverlapMessage(check.conflict.fixture_code, formatDmxRange(check.conflict))
      : ERROR_MESSAGES.DMX_ADDRESS_OUT_OF_RANGE;
    console.info(LOG_TEMPLATES.Fixture[4], message);
    throw new Error(message);
  }
  const prev = rows.find((row) => row.id === payload.id);
  const saved = prev ? payload : { ...payload, id: rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 };
  saveRows(STORAGE_KEY, prev ? rows.map((row) => (row.id === saved.id ? saved : row)) : [...rows, saved]);
  console.info(prev ? LOG_TEMPLATES.Fixture[1] : LOG_TEMPLATES.Fixture[0], saved.fixture_code);
  return saved;
}

export async function removeFixture(id: number): Promise<void> {
  const rows = await listFixture();
  const target = rows.find((row) => row.id === id);
  if (!target) return;
  const sceneNames = collectFixtureUsage(await listCueScene()).get(id) ?? [];
  if (sceneNames.length > 0) {
    const message = fixtureInUseMessage(target.fixture_code, sceneNames);
    console.info(LOG_TEMPLATES.Fixture[2], message);
    throw new Error(message);
  }
  saveRows(STORAGE_KEY, rows.filter((row) => row.id !== id));
  console.info(LOG_TEMPLATES.Fixture[2], target.fixture_code);
}
