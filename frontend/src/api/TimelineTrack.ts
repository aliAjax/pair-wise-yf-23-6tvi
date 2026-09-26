import { mockData } from "../mocks/seedData";
import type { TimelineTrack } from "../types/TimelineTrack";
import { loadRows, saveRows } from "../utils/browserStorage";
import { trackLockedMessage } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const STORAGE_KEY = "timeline-track";

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  return loadRows<TimelineTrack>(STORAGE_KEY, mockData.timelineTrack as unknown as TimelineTrack[]);
}

export async function saveTimelineTrack(payload: TimelineTrack): Promise<TimelineTrack> {
  const rows = await listTimelineTrack();
  const prev = rows.find((row) => row.id === payload.id);
  if (prev) {
    const timingChanged = prev.start_ms !== payload.start_ms || prev.duration_ms !== payload.duration_ms;
    if (prev.locked && timingChanged) {
      const message = trackLockedMessage(payload.id);
      console.info(LOG_TEMPLATES.TimelineTrack[4], message);
      throw new Error(message);
    }
  }
  const saved = prev ? payload : { ...payload, id: rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 };
  saveRows(STORAGE_KEY, prev ? rows.map((row) => (row.id === saved.id ? saved : row)) : [...rows, saved]);
  console.info(prev ? LOG_TEMPLATES.TimelineTrack[1] : LOG_TEMPLATES.TimelineTrack[0], saved.id);
  return saved;
}
