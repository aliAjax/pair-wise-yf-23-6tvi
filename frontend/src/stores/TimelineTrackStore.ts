import { create } from "zustand";
import { listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  add: (track: TimelineTrack) => Promise<boolean>;
  updateTiming: (id: number, startMs: number, durationMs: number) => Promise<boolean>;
  toggleLock: (id: number) => Promise<boolean>;
};

const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

export const useTimelineTrackStore = create<State>((set, get) => {
  const persist = async (track: TimelineTrack) => {
    set({ loading: true, error: null });
    try {
      await saveTimelineTrack(track);
      set({ rows: await listTimelineTrack(), loading: false });
      return true;
    } catch (err) {
      set({ loading: false, error: messageOf(err) });
      return false;
    }
  };
  return {
    rows: [],
    loading: false,
    error: null,
    async load() {
      set({ loading: true });
      set({ rows: await listTimelineTrack(), loading: false });
    },
    add: persist,
    async updateTiming(id, startMs, durationMs) {
      const row = get().rows.find((track) => track.id === id);
      if (!row) return false;
      return persist({ ...row, start_ms: startMs, duration_ms: durationMs });
    },
    async toggleLock(id) {
      const row = get().rows.find((track) => track.id === id);
      if (!row) return false;
      return persist({ ...row, locked: !row.locked });
    }
  };
});
