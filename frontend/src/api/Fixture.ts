import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { Fixture } from "../types/Fixture";

const STORAGE_KEY = "stage-light.fixtures";

const seedRows = (): Fixture[] => [...(mockData.fixture as unknown as Fixture[])];

function readRows(): Fixture[] {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Fixture[];
  } catch {
    // 缓存损坏时回退到种子数据，保证页面可用。
  }
  return seedRows();
}

function writeRows(rows: Fixture[]): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 浏览器拒绝写入时仅保留本次内存数据。
  }
}

export async function listFixture(): Promise<Fixture[]> {
  return readRows();
}

export async function saveFixture(payload: Fixture): Promise<Fixture> {
  const rows = readRows();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeRows(rows);
  console.info(LOG_TEMPLATES.Fixture[0], payload);
  return payload;
}

export async function removeFixture(id: number): Promise<void> {
  writeRows(readRows().filter((row) => row.id !== id));
  console.info(LOG_TEMPLATES.Fixture[4], { id });
}
