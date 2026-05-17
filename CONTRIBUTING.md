# 贡献指南

欢迎为 JobFit 做贡献！

## 贡献方式

### 1. 贡献 Prompt 模板

这是最适合产品经理的贡献方式。在 `src/prompts/templates.js` 中添加你的 Prompt 模板。

要求：
- 使用 `{jd_text}` 和 `{resume_text}` 作为占位符
- 提供清晰的结构化输出格式
- 在 PR 描述中附上 1-2 个实际使用效果截图

### 2. 贡献功能代码

- 先提 Issue 讨论你想做的功能
- Fork 仓库，在新分支上开发
- 保持组件风格一致（Composition API + `<script setup>`）
- 不要引入新的外部依赖（保持零依赖）

### 3. 提 Bug / 产品建议

直接提 Issue，请尽量描述清楚：
- 你期望的行为是什么
- 实际发生了什么
- 浏览器和操作系统版本
