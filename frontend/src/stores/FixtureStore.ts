import { create } from "zustand";
import { listFixture, removeFixture, saveFixture } from "../api/Fixture";
import { findScenesUsingFixture } from "../api/CueScene";
import { checkDmxRange } from "../hooks/useDmxAddressCheck";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatDmxRange } from "../utils/formatters";
import { useCueSceneStore } from "./CueSceneStore";
import type { Fixture } from "../types/Fixture";

export interface FixtureSaveResult {
  ok: boolean;
  message: string;
  conflictId?: number;
}

type State = {
  rows: Fixture[];
  loading: boolean;
  load: () => Promise<void>;
  save: (payload: Fixture) => Promise<FixtureSaveResult>;
  remove: (id: number) => Promise<FixtureSaveResult>;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFixture(), loading: false });
  },
  async save(payload) {
    const { rows } = get();
    const check = checkDmxRange(rows, payload);
    if (!check.ok) {
      if (check.reason === "OVERLAP" && check.conflict) {
        const hit = check.conflict;
        return {
          ok: false,
          conflictId: hit.id,
          message: `${ERROR_MESSAGES.DMX_ADDRESS_OVERLAP}：${hit.fixture_code}（占用 ${formatDmxRange(hit.dmx_address, hit.channel_count)}）`
        };
      }
      if (check.reason === "OUT_OF_RANGE" && check.range) {
        return { ok: false, message: `${ERROR_MESSAGES.DMX_OUT_OF_RANGE}：${check.range.start}–${check.range.end}` };
      }
      return { ok: false, message: ERROR_MESSAGES.DMX_ADDRESS_INVALID };
    }
    const id = payload.id > 0 ? payload.id : Math.max(0, ...rows.map((row) => row.id)) + 1;
    const next: Fixture = { ...payload, id };
    await saveFixture(next);
    set({ rows: await listFixture() });
    return { ok: true, message: `已保存 ${next.fixture_code}，占用地址 ${formatDmxRange(next.dmx_address, next.channel_count)}` };
  },
  async remove(id) {
    const fixture = get().rows.find((row) => row.id === id);
    if (!fixture) return { ok: false, message: ERROR_MESSAGES.VALIDATION_FAILED };
    const scenes = findScenesUsingFixture(useCueSceneStore.getState().rows, id);
    if (scenes.length > 0) {
      return {
        ok: false,
        message: `${ERROR_MESSAGES.FIXTURE_IN_SCENE}：${fixture.fixture_code} 被场景「${scenes[0].name}」引用`
      };
    }
    await removeFixture(id);
    set({ rows: await listFixture() });
    return { ok: true, message: `已移除 ${fixture.fixture_code}` };
  }
}));
