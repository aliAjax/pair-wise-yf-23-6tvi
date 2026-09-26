import { useEffect, useState } from "react";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { createTimelineTrackForm } from "../constructors/TimelineTrackConstructor";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatMs } from "../utils/formatters";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";

type Draft = { start_ms: string; duration_ms: string };

export function TimelinePage() {
  const { rows, loading, error, load, add, updateTiming, toggleLock } = useTimelineTrackStore();
  const scenes = useCueSceneStore((state) => state.rows);
  const loadScenes = useCueSceneStore((state) => state.load);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [sceneId, setSceneId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void load();
    void loadScenes();
  }, [load, loadScenes]);

  useEffect(() => {
    setDrafts(Object.fromEntries(rows.map((row) => [row.id, { start_ms: String(row.start_ms), duration_ms: String(row.duration_ms) }])));
  }, [rows]);

  const sceneName = (id: number) => scenes.find((scene) => scene.id === id)?.name ?? `#${id}`;
  const lockedCount = rows.filter((row) => row.locked).length;
  const totalEnd = rows.reduce((max, row) => Math.max(max, row.start_ms + row.duration_ms), 0);

  const setDraft = (id: number, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const saveTiming = async (id: number) => {
    setLocalError(null);
    setNotice(null);
    const draft = drafts[id];
    const startMs = Number(draft?.start_ms);
    const durationMs = Number(draft?.duration_ms);
    if (!Number.isFinite(startMs) || !Number.isFinite(durationMs) || startMs < 0 || durationMs <= 0) {
      setLocalError(`${ERROR_MESSAGES.VALIDATION_FAILED}：开始时间需 ≥ 0，时长需 > 0`);
      return;
    }
    const ok = await updateTiming(id, startMs, durationMs);
    if (ok) setNotice(`轨道 #${id} 时段已保存`);
  };

  const addTrack = async () => {
    setLocalError(null);
    setNotice(null);
    const target = Number(sceneId || scenes[0]?.id || 0);
    if (!target) {
      setLocalError(`${ERROR_MESSAGES.VALIDATION_FAILED}：请先选择场景`);
      return;
    }
    const layer = rows.reduce((max, row) => Math.max(max, row.layer), 0) + 1;
    const ok = await add(createTimelineTrackForm({ cue_scene_id: target, start_ms: totalEnd, layer }));
    if (ok) setNotice(`已新增轨道（场景 ${sceneName(target)}）`);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>时间轴编排</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>

      <section className="metrics">
        <StatCard label="轨道总数" value={rows.length} />
        <StatCard label="锁定轨道" value={lockedCount} />
        <StatCard label="时间轴总长" value={formatMs(totalEnd)} />
      </section>

      {(localError ?? error) ? <div className="error-banner">{localError ?? error}</div> : null}
      {notice ? <div className="notice-banner">{notice}</div> : null}

      <section className="panel wide">
        <h2>轨道列表</h2>
        {rows.length === 0 && !loading ? <EmptyState title="暂无轨道，先新增一条" /> : (
          <table className="fixture-table">
            <thead>
              <tr>
                <th>轨道</th>
                <th>场景</th>
                <th>图层</th>
                <th>开始 (ms)</th>
                <th>时长 (ms)</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>#{row.id}</td>
                  <td>{sceneName(row.cue_scene_id)}</td>
                  <td>{row.layer}</td>
                  <td>
                    <input className="timing-input" type="number" min={0} disabled={row.locked}
                      value={drafts[row.id]?.start_ms ?? String(row.start_ms)}
                      onChange={(event) => setDraft(row.id, { start_ms: event.target.value })} />
                  </td>
                  <td>
                    <input className="timing-input" type="number" min={1} disabled={row.locked}
                      value={drafts[row.id]?.duration_ms ?? String(row.duration_ms)}
                      onChange={(event) => setDraft(row.id, { duration_ms: event.target.value })} />
                  </td>
                  <td>
                    <StatusBadge value={row.locked ? "已锁定" : "可调整"} className={row.locked ? "locked" : "unlocked"} />
                    {row.locked ? <div className="cell-hint">时段只读</div> : null}
                  </td>
                  <td className="row-actions">
                    <button className="primary" disabled={row.locked || loading}
                      title={row.locked ? ERROR_MESSAGES.TRACK_LOCKED : "保存开始与时长"}
                      onClick={() => void saveTiming(row.id)}>保存时段</button>
                    <button className="ghost" onClick={() => void toggleLock(row.id)}>
                      {row.locked ? "解锁" : "锁定"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="form-actions">
          <select value={sceneId} onChange={(event) => setSceneId(event.target.value)}>
            <option value="">选择场景</option>
            {scenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.name}</option>)}
          </select>
          <button className="ghost" onClick={() => void addTrack()} disabled={loading}>新增轨道</button>
        </div>
      </section>
    </main>
  );
}
