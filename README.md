# mao-origami

儿童折纸演示器与未来折纸编辑器的项目骨架。

当前阶段目标：

- 提供一个基于 Web 的折纸步骤演示器。
- 使用统一的 `OrigamiDocument` 数据结构驱动播放器。
- 从第一版开始为“用户折纸编辑器 + 演示器”预留模块边界。

## 当前结构

- `doc/`：项目设计文档。
- `src/core/`：与 UI 解耦的核心模型、播放、校验和序列化边界。
- `src/features/`：播放器、3D 视图、步骤面板，以及编辑器预留模块。
- `.github/copilot-instructions.md`：仓库级 Copilot 协作约束。

## 已有文档

- `doc/origami-data-model.md`
- `doc/project-plan.md`

## 启动方式

需要 Node.js 26+ 和 npm 11+。

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

## 当前骨架包含

- Vite + React + TypeScript 前端工程
- `react-router-dom` 路由
- `@react-three/fiber` 和 `drei` 3D 视图基础
- `zustand` 播放状态管理
- `zod` 文档校验入口
- `/play/:modelId` 播放页
- `/edit/:modelId` 编辑器占位页

## 后续建议

1. 先完善 `OrigamiDocument` 对应的 TypeScript 类型和校验。
2. 再把播放器中的示例文档替换为真实折纸步骤数据。
3. 最后补齐命令执行与几何状态缓存，逐步接入编辑器。