import { mockData } from "../mocks/seedData";
import type { CueScene } from "../types/CueScene";
import { loadRows, saveRows } from "../utils/browserStorage";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const STORAGE_KEY = "cue-scene";

export async function listCueScene(): Promise<CueScene[]> {
  return loadRows<CueScene>(STORAGE_KEY, mockData.cueScene as unknown as CueScene[]);
}

export async function saveCueScene(payload: CueScene): Promise<CueScene> {
  const rows = await listCueScene();
  const prev = rows.find((row) => row.id === payload.id);
  const saved = prev ? payload : { ...payload, id: rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 };
  saveRows(STORAGE_KEY, prev ? rows.map((row) => (row.id === saved.id ? saved : row)) : [...rows, saved]);
  console.info(prev ? LOG_TEMPLATES.CueScene[1] : LOG_TEMPLATES.CueScene[0], saved.name);
  return saved;
}
