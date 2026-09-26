import { create } from "zustand";
import { listFixture, removeFixture, saveFixture } from "../api/Fixture";
import type { Fixture } from "../types/Fixture";

type State = {
  rows: Fixture[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  save: (fixture: Fixture) => Promise<boolean>;
  remove: (id: number) => Promise<boolean>;
};

const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

export const useFixtureStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: null,
  async load() {
    set({ loading: true });
    set({ rows: await listFixture(), loading: false });
  },
  async save(fixture) {
    set({ loading: true, error: null });
    try {
      await saveFixture(fixture);
      set({ rows: await listFixture(), loading: false });
      return true;
    } catch (err) {
      set({ loading: false, error: messageOf(err) });
      return false;
    }
  },
  async remove(id) {
    set({ loading: true, error: null });
    try {
      await removeFixture(id);
      set({ rows: await listFixture(), loading: false });
      return true;
    } catch (err) {
      set({ loading: false, error: messageOf(err) });
      return false;
    }
  }
}));
