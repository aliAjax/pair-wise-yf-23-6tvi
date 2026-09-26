import { useEffect, useMemo, useState } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { DMX_UNIVERSE_SIZE, fixtureRange, useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { createFixtureForm } from "../constructors/FixtureConstructor";
import { FixtureType } from "../constants/FixtureType";
import { ChannelMode, ChannelModeChannels } from "../constants/ChannelMode";
import { listSceneFixtureIds } from "../api/CueScene";
import { formatDmxRange } from "../utils/formatters";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { FixtureIcon } from "../components/common/FixtureIcon";
import type { Fixture } from "../types/Fixture";

interface Notice {
  ok: boolean;
  message: string;
  conflictId?: number;
}

export function FixturesPage() {
  const rows = useFixtureStore((state) => state.rows);
  const load = useFixtureStore((state) => state.load);
  const save = useFixtureStore((state) => state.save);
  const remove = useFixtureStore((state) => state.remove);
  const scenes = useCueSceneStore((state) => state.rows);
  const loadScenes = useCueSceneStore((state) => state.load);

  const [form, setForm] = useState<Fixture>(() => createFixtureForm());
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    void load();
    void loadScenes();
  }, [load, loadScenes]);

  const check = useDmxAddressCheck(rows);
  const live = useMemo(() => (form.dmx_address === "" ? null : check(form)), [check, form]);
  const liveConflictId = live && !live.ok && live.reason === "OVERLAP" ? live.conflict?.id : undefined;
  const highlightId = liveConflictId ?? (notice && !notice.ok ? notice.conflictId : undefined);

  const sceneFixtureIds = useMemo(() => listSceneFixtureIds(scenes), [scenes]);
  const usedChannels = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.channel_count) || 0), 0),
    [rows]
  );
  const lockedCount = useMemo(
    () => rows.filter((row) => sceneFixtureIds.has(row.id)).length,
    [rows, sceneFixtureIds]
  );

  const update = (patch: Partial<Fixture>) => setForm((prev) => ({ ...prev, ...patch }));

  const onSubmit = async () => {
    const payload: Fixture = {
      ...form,
      fixture_code: form.fixture_code.trim() || `F-${String(rows.length + 1).padStart(2, "0")}`
    };
    const result = await save(payload);
    setNotice(result);
    if (result.ok) {
      setForm(createFixtureForm({
        fixture_type: form.fixture_type,
        color_mode: form.color_mode,
        channel_count: form.channel_count
      }));
    }
  };

  const onRemove = async (id: number) => {
    setNotice(await remove(id));
  };

  return (
    <>
      <section className="metrics">
        <StatCard label="灯具总数" value={rows.length} />
        <StatCard label="已占用通道" value={`${usedChannels} / ${DMX_UNIVERSE_SIZE}`} />
        <StatCard label="进场景锁定" value={lockedCount} />
      </section>

      {notice && <p className={notice.ok ? "notice ok" : "notice err"}>{notice.message}</p>}

      <section className="workbench">
        <div className="panel wide">
          <h2>布置表 · DMX 地址占用</h2>
          <div className="dmx-bar">
            {rows.map((row) => {
              const range = fixtureRange(row);
              if (!Number.isFinite(range.start) || !Number.isFinite(range.end)) return null;
              const left = ((range.start - 1) / DMX_UNIVERSE_SIZE) * 100;
              const width = ((range.end - range.start + 1) / DMX_UNIVERSE_SIZE) * 100;
              return (
                <span
                  key={row.id}
                  className={highlightId === row.id ? "dmx-seg hit" : "dmx-seg"}
                  style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%` }}
                  title={`${row.fixture_code} ${formatDmxRange(row.dmx_address, row.channel_count)}`}
                />
              );
            })}
          </div>
          <div className="dmx-scale"><span>1</span><span>{DMX_UNIVERSE_SIZE}</span></div>

          {rows.length === 0 ? <EmptyState title="尚未布置灯具" /> : (
            <table className="grid">
              <thead>
                <tr>
                  <th>编号</th><th>类型</th><th>位置</th><th>起始地址</th><th>通道数</th>
                  <th>地址占用</th><th>颜色模式</th><th>锁定状态</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const inScene = sceneFixtureIds.has(row.id);
                  return (
                    <tr key={row.id} className={highlightId === row.id ? "conflict" : ""}>
                      <td><strong>{row.fixture_code}</strong></td>
                      <td><StatusBadge value={row.fixture_type} /></td>
                      <td>({row.position_x}, {row.position_y})</td>
                      <td>{row.dmx_address}</td>
                      <td>{row.channel_count}</td>
                      <td>{formatDmxRange(row.dmx_address, row.channel_count)}</td>
                      <td><StatusBadge value={row.color_mode} /></td>
                      <td>{inScene
                        ? <span className="badge locked">已进场景</span>
                        : <span className="badge free">可调整</span>}</td>
                      <td><button className="small danger" onClick={() => void onRemove(row.id)}>移除</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <h2>录入灯具</h2>
          <FixtureIcon title={form.fixture_code.trim() || "新灯具"} value={form.fixture_type} />
          <div className="form-grid">
            <label className="field span2">
              编号
              <input
                value={form.fixture_code}
                placeholder="如 F-06"
                onChange={(event) => update({ fixture_code: event.target.value })}
              />
            </label>
            <label className="field span2">
              类型
              <select
                value={form.fixture_type}
                onChange={(event) => update({ fixture_type: event.target.value })}
              >
                {FixtureType.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="field">
              位置 X（米）
              <input
                value={form.position_x}
                placeholder="如 2.5"
                onChange={(event) => update({ position_x: event.target.value })}
              />
            </label>
            <label className="field">
              位置 Y（米）
              <input
                value={form.position_y}
                placeholder="如 0.8"
                onChange={(event) => update({ position_y: event.target.value })}
              />
            </label>
            <label className="field">
              起始地址
              <input
                type="number"
                min={1}
                max={DMX_UNIVERSE_SIZE}
                value={form.dmx_address}
                placeholder="1–512"
                onChange={(event) => update({ dmx_address: event.target.value })}
              />
            </label>
            <label className="field">
              通道数
              <input
                type="number"
                min={1}
                max={DMX_UNIVERSE_SIZE}
                value={form.channel_count}
                onChange={(event) => update({ channel_count: Number(event.target.value) })}
              />
            </label>
            <label className="field span2">
              颜色模式
              <select
                value={form.color_mode}
                onChange={(event) => {
                  const mode = event.target.value as ChannelMode;
                  update({ color_mode: mode, channel_count: ChannelModeChannels[mode] ?? form.channel_count });
                }}
              >
                {ChannelMode.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>

          {live && !live.ok && (
            <p className="hint">
              {live.reason === "OVERLAP" && live.conflict
                ? `地址段 ${live.range?.start}–${live.range?.end} 与 ${live.conflict.fixture_code}（${formatDmxRange(live.conflict.dmx_address, live.conflict.channel_count)}）重叠`
                : live.reason === "OUT_OF_RANGE" && live.range
                  ? `地址段 ${live.range.start}–${live.range.end} 越过 ${DMX_UNIVERSE_SIZE}`
                  : "起始地址和通道数需为不小于 1 的整数"}
            </p>
          )}

          <div className="form-actions">
            <button className="primary" onClick={() => void onSubmit()}>保存灯具</button>
          </div>
          <p className="storage-note">记录保存在浏览器 localStorage，刷新不丢失；与已有灯具重叠或越过 512 时不会写入。</p>
        </div>
      </section>
    </>
  );
}
