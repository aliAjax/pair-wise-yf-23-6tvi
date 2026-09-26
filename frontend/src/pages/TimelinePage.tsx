import { useEffect, useState } from "react";
import { isTrackLocked, useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { formatMs } from "../utils/formatters";
import { EmptyState } from "../components/common/EmptyState";
import type { TimelineTrack } from "../types/TimelineTrack";

interface Notice {
  ok: boolean;
  message: string;
}

export function TimelinePage() {
  const rows = useTimelineTrackStore((state) => state.rows);
  const load = useTimelineTrackStore((state) => state.load);
  const adjustTiming = useTimelineTrackStore((state) => state.adjustTiming);
  const toggleLock = useTimelineTrackStore((state) => state.toggleLock);
  const scenes = useCueSceneStore((state) => state.rows);
  const loadScenes = useCueSceneStore((state) => state.load);

  const [drafts, setDrafts] = useState<Record<number, { start_ms: string; duration_ms: string }>>({});
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    void load();
    void loadScenes();
  }, [load, loadScenes]);

  const sceneName = (id: number) => scenes.find((scene) => scene.id === id)?.name ?? `场景 #${id}`;

  const draftOf = (row: TimelineTrack, key: "start_ms" | "duration_ms") => drafts[row.id]?.[key] ?? row[key];

  const setDraft = (id: number, key: "start_ms" | "duration_ms", value: string) => {
    setDrafts((prev) => {
      const current = prev[id] ?? { start_ms: "", duration_ms: "" };
      return { ...prev, [id]: { ...current, [key]: value } };
    });
  };

  const onAdjust = async (row: TimelineTrack) => {
    setNotice(await adjustTiming(row.id, draftOf(row, "start_ms"), draftOf(row, "duration_ms")));
  };

  return (
    <>
      {notice && <p className={notice.ok ? "notice ok" : "notice err"}>{notice.message}</p>}

      <section className="panel wide">
        <h2>轨道列表 · 锁住的轨道不接受时段调整</h2>
        {rows.length === 0 ? <EmptyState title="时间轴上还没有轨道" /> : (
          <table className="grid">
            <thead>
              <tr>
                <th>轨道</th><th>场景</th><th>开始</th><th>时长</th><th>图层</th>
                <th>锁定状态</th><th>时段调整（开始 ms / 时长 ms）</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const locked = isTrackLocked(row);
                return (
                  <tr key={row.id}>
                    <td><strong>#{row.id}</strong></td>
                    <td>{sceneName(row.cue_scene_id)}</td>
                    <td>{formatMs(row.start_ms)}</td>
                    <td>{formatMs(row.duration_ms)}</td>
                    <td>{row.layer}</td>
                    <td>{locked
                      ? <span className="badge locked">已锁定</span>
                      : <span className="badge free">未锁定</span>}</td>
                    <td className="adjust-cell">
                      <input
                        type="number"
                        min={0}
                        value={draftOf(row, "start_ms")}
                        onChange={(event) => setDraft(row.id, "start_ms", event.target.value)}
                      />
                      <input
                        type="number"
                        min={1}
                        value={draftOf(row, "duration_ms")}
                        onChange={(event) => setDraft(row.id, "duration_ms", event.target.value)}
                      />
                      <button className="small" onClick={() => void onAdjust(row)}>调整</button>
                    </td>
                    <td>
                      <button className="small" onClick={() => void toggleLock(row.id)}>
                        {locked ? "解锁" : "锁定"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
