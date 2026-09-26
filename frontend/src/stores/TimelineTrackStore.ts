import { create } from "zustand";
import { listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { TimelineTrack } from "../types/TimelineTrack";

export interface TrackAdjustResult {
  ok: boolean;
  message: string;
}

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  adjustTiming: (id: number, start_ms: string, duration_ms: string) => Promise<TrackAdjustResult>;
  toggleLock: (id: number) => Promise<void>;
};

export const isTrackLocked = (track: TimelineTrack) => track.locked === "true";

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listTimelineTrack(), loading: false });
  },
  async adjustTiming(id, start_ms, duration_ms) {
    const track = get().rows.find((row) => row.id === id);
    if (!track) return { ok: false, message: ERROR_MESSAGES.VALIDATION_FAILED };
    if (isTrackLocked(track)) {
      return { ok: false, message: `${ERROR_MESSAGES.TRACK_LOCKED}：轨道 #${track.id}` };
    }
    const start = Number(start_ms);
    const duration = Number(duration_ms);
    if (!Number.isFinite(start) || !Number.isFinite(duration) || start < 0 || duration <= 0) {
      return { ok: false, message: ERROR_MESSAGES.VALIDATION_FAILED };
    }
    await saveTimelineTrack({ ...track, start_ms: String(start), duration_ms: String(duration) });
    set({ rows: await listTimelineTrack() });
    return { ok: true, message: `轨道 #${id} 时段已更新为 ${start} ms / ${duration} ms` };
  },
  async toggleLock(id) {
    const track = get().rows.find((row) => row.id === id);
    if (!track) return;
    await saveTimelineTrack({ ...track, locked: isTrackLocked(track) ? "false" : "true" });
    set({ rows: await listTimelineTrack() });
  }
}));
