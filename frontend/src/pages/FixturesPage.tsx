import { useEffect, useMemo, useState } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { createFixtureForm } from "../constructors/FixtureConstructor";
import { FixtureType } from "../constants/FixtureType";
import { ChannelMode } from "../constants/ChannelMode";
import { STATUS_TEXT } from "../constants/statusText";
import { ERROR_MESSAGES, dmxOverlapMessage, fixtureInUseMessage } from "../constants/errorMessages";
import { DMX_UNIVERSE_SIZE } from "../constants/dmx";
import { formatDmxRange } from "../utils/dmx";
import { collectFixtureUsage } from "../utils/cueSceneUsage";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { FixtureIcon } from "../components/common/FixtureIcon";
import { DmxBadge } from "../components/common/DmxBadge";
import { DmxOccupancyBar } from "../components/common/DmxOccupancyBar";
import { EmptyState } from "../components/common/EmptyState";
import type { Fixture } from "../types/Fixture";

export function FixturesPage() {
  const { rows, loading, error, load, save, remove } = useFixtureStore();
  const scenes = useCueSceneStore((state) => state.rows);
  const loadScenes = useCueSceneStore((state) => state.load);
  const [form, setForm] = useState<Fixture>(() => createFixtureForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void load();
    void loadScenes();
  }, [load, loadScenes]);

  const { occupied, free, check } = useDmxAddressCheck(rows);
  const usage = useMemo(() => collectFixtureUsage(scenes), [scenes]);

  const start = Number(form.dmx_address);
  const count = Number(form.channel_count);
  const rangePreview = Number.isInteger(start) && Number.isInteger(count) && count > 0 && start >= 1
    ? formatDmxRange({ dmx_address: start, channel_count: count })
    : null;

  const resetForm = () => {
    setForm(createFixtureForm());
    setEditingId(null);
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    setNotice(null);
    if (!form.fixture_code.trim()) {
      setFormError(`${ERROR_MESSAGES.VALIDATION_FAILED}：编号必填`);
      return;
    }
    const result = check(start, count, editingId ?? undefined);
    if (!result.ok) {
      setFormError(result.code === "DMX_ADDRESS_OVERLAP"
        ? dmxOverlapMessage(result.conflict.fixture_code, formatDmxRange(result.conflict))
        : ERROR_MESSAGES.DMX_ADDRESS_OUT_OF_RANGE);
      return;
    }
    const ok = await save({ ...form, id: editingId ?? 0, dmx_address: start, channel_count: count });
    if (ok) {
      setNotice(editingId ? `灯具 ${form.fixture_code} 已更新` : `灯具 ${form.fixture_code} 已写入布置表`);
      resetForm();
    }
  };

  const editRow = (row: Fixture) => {
    setForm({ ...row });
    setEditingId(row.id);
    setFormError(null);
    setNotice(null);
  };

  const removeRow = async (row: Fixture) => {
    setFormError(null);
    setNotice(null);
    const ok = await remove(row.id);
    if (ok) {
      setNotice(`灯具 ${row.fixture_code} 已移出布置表`);
      if (editingId === row.id) resetForm();
    }
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>灯具布置台</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>

      <section className="metrics">
        <StatCard label="灯具总数" value={rows.length} />
        <StatCard label="已占用通道" value={`${occupied} / ${DMX_UNIVERSE_SIZE}`} />
        <StatCard label="空闲通道" value={free} />
      </section>

      {(formError ?? error) ? <div className="error-banner">{formError ?? error}</div> : null}
      {notice ? <div className="notice-banner">{notice}</div> : null}

      <section className="panel wide">
        <h2>DMX 地址占用</h2>
        <DmxOccupancyBar fixtures={rows} highlightId={editingId} />
        <div className="dmx-legend">
          <span>1</span>
          <span>已占用 {occupied} 通道 · 空闲 {free} 通道</span>
          <span>{DMX_UNIVERSE_SIZE}</span>
        </div>
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>布置表</h2>
          {rows.length === 0 && !loading ? <EmptyState title="布置表为空，先在右侧录入灯具" /> : (
            <table className="fixture-table">
              <thead>
                <tr>
                  <th>编号</th>
                  <th>类型</th>
                  <th>位置</th>
                  <th>DMX 地址段</th>
                  <th>通道数</th>
                  <th>颜色模式</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const sceneNames = usage.get(row.id) ?? [];
                  const inScene = sceneNames.length > 0;
                  return (
                    <tr key={row.id}>
                      <td><FixtureIcon title={row.fixture_code} /></td>
                      <td><StatusBadge value={row.fixture_type} /></td>
                      <td>({row.position_x}, {row.position_y})</td>
                      <td><DmxBadge fixture={row} /></td>
                      <td>{row.channel_count}</td>
                      <td>{STATUS_TEXT.ChannelMode[row.color_mode as ChannelMode] ?? row.color_mode}</td>
                      <td>
                        {inScene
                          ? <StatusBadge value="场景中" className="in-scene" />
                          : <StatusBadge value="空闲" />}
                        {inScene ? <div className="cell-hint">{sceneNames.join("、")}</div> : null}
                      </td>
                      <td className="row-actions">
                        <button className="ghost" onClick={() => editRow(row)}>编辑</button>
                        <button
                          className="danger"
                          disabled={inScene}
                          title={inScene ? fixtureInUseMessage(row.fixture_code, sceneNames) : "移出布置表"}
                          onClick={() => void removeRow(row)}
                        >删除</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <h2>{editingId ? `编辑灯具 ${form.fixture_code}` : "录入灯具"}</h2>
          <div className="form-grid">
            <label className="field">编号
              <input value={form.fixture_code} placeholder="如 PAR-03"
                onChange={(event) => setForm({ ...form, fixture_code: event.target.value })} />
            </label>
            <label className="field">类型
              <select value={form.fixture_type}
                onChange={(event) => setForm({ ...form, fixture_type: event.target.value })}>
                {FixtureType.map((type) => <option key={type} value={type}>{STATUS_TEXT.FixtureType[type]}</option>)}
              </select>
            </label>
            <label className="field">颜色模式
              <select value={form.color_mode}
                onChange={(event) => setForm({ ...form, color_mode: event.target.value })}>
                {ChannelMode.map((mode) => <option key={mode} value={mode}>{STATUS_TEXT.ChannelMode[mode]}</option>)}
              </select>
            </label>
            <label className="field">位置 X
              <input value={form.position_x}
                onChange={(event) => setForm({ ...form, position_x: event.target.value })} />
            </label>
            <label className="field">位置 Y
              <input value={form.position_y}
                onChange={(event) => setForm({ ...form, position_y: event.target.value })} />
            </label>
            <label className="field">起始地址
              <input type="number" min={1} max={DMX_UNIVERSE_SIZE} value={form.dmx_address}
                onChange={(event) => setForm({ ...form, dmx_address: Number(event.target.value) })} />
            </label>
            <label className="field">通道数
              <input type="number" min={1} value={form.channel_count}
                onChange={(event) => setForm({ ...form, channel_count: Number(event.target.value) })} />
            </label>
          </div>
          {rangePreview ? <p className="range-hint">占用地址段 {rangePreview}（共 {DMX_UNIVERSE_SIZE} 通道）</p> : null}
          <div className="form-actions">
            <button className="primary" onClick={() => void submit()} disabled={loading}>
              {editingId ? "保存修改" : "写入布置表"}
            </button>
            {editingId ? <button className="ghost" onClick={resetForm}>取消编辑</button> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
