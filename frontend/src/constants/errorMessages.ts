export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  DMX_ADDRESS_INVALID: "起始地址或通道数不是有效整数",
  DMX_OUT_OF_RANGE: "地址段越过 512，保存未写入",
  DMX_ADDRESS_OVERLAP: "地址段与已有灯具重叠，保存未写入",
  FIXTURE_IN_SCENE: "灯具已进入场景，留在布置表中",
  TRACK_LOCKED: "轨道已锁定，不接受时段调整"
};
