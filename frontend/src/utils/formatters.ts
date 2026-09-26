export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatDmxRange = (start: string | number, count: string | number) => {
  const s = Number(start);
  const c = Number(count);
  if (!Number.isFinite(s) || !Number.isFinite(c) || c < 1) return "—";
  return `${s}–${s + c - 1}`;
};
export const formatMs = (value: string | number) => `${formatNumber(Number(value) || 0)} ms`;
