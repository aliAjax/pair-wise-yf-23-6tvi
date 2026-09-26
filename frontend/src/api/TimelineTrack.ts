import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { TimelineTrack } from "../types/TimelineTrack";

const STORAGE_KEY = "stage-light.timelineTracks";

const seedRows = (): TimelineTrack[] => [...(mockData.timelineTrack as unknown as TimelineTrack[])];

function readRows(): TimelineTrack[] {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TimelineTrack[];
  } catch {
    // 缓存损坏时回退到种子数据，保证页面可用。
  }
  return seedRows();
}

function writeRows(rows: TimelineTrack[]): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 浏览器拒绝写入时仅保留本次内存数据。
  }
}

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  return readRows();
}

export async function saveTimelineTrack(payload: TimelineTrack): Promise<TimelineTrack> {
  const rows = readRows();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeRows(rows);
  console.info(LOG_TEMPLATES.TimelineTrack[1], payload);
  return payload;
}
