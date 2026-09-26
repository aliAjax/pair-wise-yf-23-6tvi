# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`

## 灯具布置台（/fixtures）

- 录入字段：编号、类型、位置 X/Y、起始地址、通道数、颜色模式；颜色模式会带出默认通道数（RGB 3 / RGBW 4 / DIMMER_ONLY 1 / MOVING_HEAD 16）。
- 地址段 = 起始地址 … 起始地址 + 通道数 - 1；与已有灯具重叠或越过 512 时保存不写入，提示中指明冲突灯具并在布置表和地址占用条上高亮。
- 已进入场景（被 CueScene 的 fixture_states 引用）的灯具不可移除，留在布置表中；列表展示每盏灯的地址占用和锁定状态。
- 时间轴编排（/timeline）中锁定的轨道不接受时段调整，解锁后才可修改开始/时长。
- 记录保存在浏览器 localStorage：`stage-light.fixtures`、`stage-light.cueScenes`、`stage-light.timelineTracks`，清除站点数据即可重置为种子数据。

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- DMX 校验相关：错误码 constants/errorCodes、错误消息 constants/errorMessages、地址段检查 hooks/useDmxAddressCheck、范围格式化 utils/formatters，被 FixtureStore 与 FixturesPage 共同引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
