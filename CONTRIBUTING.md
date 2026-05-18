# 贡献指南

欢迎为 JobFit 做贡献！本文档说明项目的协作规范。

## 贡献方式

### 1. 贡献 Prompt 模板

这是最适合非开发者的贡献方式。在 `src/prompts/templates.js` 中添加你的 Prompt 模板。

要求：
- 使用 `{jd_text}` 和 `{resume_text}` 作为占位符
- 提供清晰的结构化输出格式
- 在 PR 描述中附上 1-2 个实际使用效果截图

### 2. 贡献功能代码

- 先提 Issue 讨论你想做的功能
- Fork 仓库，在新分支上开发
- 保持组件风格一致（Composition API + `<script setup>`）
- 不要引入新的外部运行时依赖（保持零依赖），devDependencies 除外

### 3. 提 Bug / 产品建议

使用对应的 Issue 模板提交，请尽量描述清楚：
- 你期望的行为是什么
- 实际发生了什么
- 浏览器和操作系统版本

## 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/)。

格式：`<type>(<scope>): <subject>`

- **type**: `feat` / `fix` / `refactor` / `docs` / `chore` / `test` / `style`
- **scope**: `tracker` / `resume` / `jd` / `match` / `interview` / `store` / `prompts` / `ci`
- **subject**: 小写中文，≤72 字符，不以句号结尾

示例：
```
feat(tracker): 添加投递编辑功能
fix(resume): 修复PDF解析中文乱码
docs: 更新README安装说明
```

每个提交应包含一个独立的逻辑变更。

## 分支策略

- `main` 始终保持可发布状态
- 功能分支命名：`<type>/<简短描述>`，如 `feat/chrome-extension`、`fix/pdf-parser`
- 小修正（错别字等）可直接提交到 `main`，功能/修复级别走 PR

## PR 要求

PR 描述请使用模板，包含三个部分：

1. **概述** — 做了什么，为什么
2. **测试计划** — 运行了哪些验证（`npm run dev`、`npm run build`）
3. **后续** — 刻意不在本次处理的内容

### 代码风格

- Vue 3 Composition API + `<script setup>`，不混用 Options API
- 组件单文件不超过 ~400 行，超出则拆分
- 公共样式变量使用 `var(--xxx)`，定义在 `src/assets/style.css`
- 不引入新文件——复用已有的 `card`、`btn`、`tag`、`form-group` 等样式类

## 版本与 CHANGELOG

- 遵循 [语义化版本](https://semver.org/lang/zh-CN/)
- 有用户感知的变更必须在 `CHANGELOG.md` 中记录，按 Keep a Changelog 格式
- 开发期间写入 `## [Unreleased]`，发版时改为版本号
