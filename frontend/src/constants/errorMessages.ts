export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  DMX_ADDRESS_OVERLAP: "DMX 地址段与已有灯具重叠",
  DMX_ADDRESS_OUT_OF_RANGE: "起始地址加通道数越界（DMX 仅允许 1–512），未写入",
  FIXTURE_IN_USE: "灯具已进入场景，按规则保留在布置表中，不能移除",
  TRACK_LOCKED: "轨道已锁定，不接受时段调整"
};

export const dmxOverlapMessage = (fixtureCode: string, occupiedRange: string) =>
  `保存被拒绝：地址段与灯具 ${fixtureCode}（已占用 ${occupiedRange}）重叠，未写入`;

export const fixtureInUseMessage = (fixtureCode: string, sceneNames: string[]) =>
  `灯具 ${fixtureCode} 已进入场景（${sceneNames.join("、")}），按规则保留在布置表中，不能移除`;

export const trackLockedMessage = (trackId: number) =>
  `轨道 #${trackId} 已锁定，时段调整未写入`;
