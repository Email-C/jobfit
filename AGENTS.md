# JobFit

本文件是给 AI 协作者的项目级说明。它总结了这个仓库的工作方式、容易踩的坑和必须同步的文件。

## 项目概况

- 项目名：JobFit
- 仓库：`Email-C/jobfit`
- 类型：Vue 3 + Vite 纯前端 SPA
- 目标：帮助应届生用 AI Prompt 模板完成 JD 解析、人岗匹配、面试准备和投递追踪的全流程闭环

## 工作方式

- 先读 `README.md` 和相关源码，再动手改。
- 只改当前任务需要的文件，避免顺手重构。
- 没有明确要求时，不要主动 commit、push、merge。
- 需要提交时，使用 Conventional Commits。
- 做 PR review 时，只看最新 head 的代码和 checks，不要依赖旧结论。

## 版本与文档同步

- 有用户感知的功能变化时，更新 `CHANGELOG.md`（按 Keep a Changelog 格式写入 `## [Unreleased]`）。
- 功能增删或优先级调整时，同步更新 `ROADMAP.md`。
- 新增 Prompt 模板或修改已有模板的占位符/输出格式时，确保 `src/prompts/templates.js` 中所有引用该占位符的模板保持一致。

## 代码规范与架构

- 一个组件文件尽量不超过 ~400 行；超出时优先拆分子组件。
- `src/stores/useStore.js` 是唯一状态源，所有组件通过 `useStore()` 读取/修改数据。
- 状态持久化依赖 `localStorage`，数据变更通过 `watch(deep: true)` 自动写入。
- 组件职责分明：
  - `JobTracker.vue` — 投递记录管理
  - `ResumeManager.vue` — 简历文件解析 + 手动编辑
  - `JDParser.vue` — JD 文本解析 Prompt 生成
  - `MatchAnalyzer.vue` — 人岗匹配分析
  - `InterviewPrep.vue` — 面试准备方案
- 公共样式变量定义在 `src/assets/style.css` 的 `:root` 块中，所有组件通过 `var(--xxx)` 引用。
- 不要再建新的样式系统或 CSS 工具类文件，复用已有的 `.card`、`.btn`、`.btn-primary`、`.tag` 等。
- 禁止引入新的运行时 npm 依赖（devDependencies 除外）。

## 已知陷阱

- `localStorage` 中的数据没有 schema 版本号；修改 `createDefault()` 返回结构时，旧用户的已有数据可能缺字段。需要在取值处做防御（`|| ''`、`|| []`）。
- `mammoth` 库解析 `.docx` 时只提取纯文本，不保留表格和格式；PDF 解析依赖 CDN 加载 `pdf.js`，网络不通时会失败。
- `vite.config.js` 中 `base: '/jobfit/'` 是给 GitHub Pages 用的；本地 `npm run dev` 时所有路径都是 `/`，不要硬编码 `/jobfit/` 前缀。
- 图片简历解析不走本地 OCR——只是把图片转 base64 给用户复制，让多模态 AI 去处理。
- 投递状态流转的圆点按钮没有文字标签，只靠颜色和 title 提示，注意可访问性。
- `window.open` 可能被浏览器弹窗拦截器阻止，`openAllLinks` 建议用户允许弹窗。

## 本地笔记

- 项目为 GitHub Pages 部署（gh-pages 分支），构建输出到 `dist/`。
- 无需 `.env` 或任何服务端配置，纯静态资源。
