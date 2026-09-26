import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { CueScene } from "../types/CueScene";

const STORAGE_KEY = "stage-light.cueScenes";

const seedRows = (): CueScene[] => [...(mockData.cueScene as unknown as CueScene[])];

function readRows(): CueScene[] {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CueScene[];
  } catch {
    // 缓存损坏时回退到种子数据，保证页面可用。
  }
  return seedRows();
}

function writeRows(rows: CueScene[]): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 浏览器拒绝写入时仅保留本次内存数据。
  }
}

export async function listCueScene(): Promise<CueScene[]> {
  return readRows();
}

export async function saveCueScene(payload: CueScene): Promise<CueScene> {
  const rows = readRows();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeRows(rows);
  console.info(LOG_TEMPLATES.CueScene[0], payload);
  return payload;
}

/** 解析场景的 fixture_states（JSON 字符串），返回引用到的灯具 id。 */
export function listSceneFixtureIds(scenes: CueScene[]): Set<number> {
  const ids = new Set<number>();
  for (const scene of scenes) {
    try {
      const states = JSON.parse(scene.fixture_states) as Array<{ fixture_id?: number }>;
      if (!Array.isArray(states)) continue;
      for (const state of states) {
        if (typeof state?.fixture_id === "number") ids.add(state.fixture_id);
      }
    } catch {
      // fixture_states 不是 JSON 的场景不参与占用判断。
    }
  }
  return ids;
}

/** 找出引用了某盏灯的场景，用于删除保护提示。 */
export function findScenesUsingFixture(scenes: CueScene[], fixtureId: number): CueScene[] {
  return scenes.filter((scene) => listSceneFixtureIds([scene]).has(fixtureId));
}
