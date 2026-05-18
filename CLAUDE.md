---
project: "JobFit"
branch: "main"
---

# CLAUDE.md — AI 协作者说明

JobFit 是一个面向应届生的 AI 求职准备工具箱，基于 Vue 3 + Vite 构建的纯前端 SPA。本文件记录**每次会话必读**的工作流。

## 相关文档

| 想看... | 去哪里 |
|---|---|
| 项目介绍、技术栈、功能列表 | [`README.md`](README.md) |
| 路线图与版本规划 | [`ROADMAP.md`](ROADMAP.md) |
| 变更记录 | [`CHANGELOG.md`](CHANGELOG.md) |
| 贡献规范、提交格式、分支策略 | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| AI 工作流与常见陷阱 | [`AGENTS.md`](AGENTS.md) |

---

## 启动准则

三条硬规则：

- **需明确指令才 Commit**。对话里讨论到"要提交"不算指令，必须出现"请提交 / 请 commit / 请开 PR"这类明确祈使句
- **一般不在 main 直接工作**，但**允许例外**：大 PR merge 完后的 chore/docs 级小修补（改 typo、补遗漏字段）可以直接在 main 上。feat/fix/refactor 级一律走分支
- **不主动 push**。即使刚 commit 完，也等用户说"请推"

## 分支命名

`<type>/<topic>`，type 用 Conventional Commits 的类型。例：
- `feat/chrome-extension`
- `fix/pdf-parser`

## 单次迭代循环

一个大修改（从"你决定要做 X"到"main 合进 X"）的标准循环：

1. **对齐计划**：动手前用 1-2 段话描述打算做什么、拆成几个 commit、可能的风险。等用户点头
2. **拉分支**：按上面的命名约定
3. **动手**：按 commit 主题分批提交，每个中间 commit 都保持可运行
4. **本地验证**：`npm run dev` 正常启动，`npm run build` 无报错
5. **推分支 + 开 PR**：PR body 包含概述 / 测试计划 / 后续 三段
6. **应对 CR**：blocking 和 should-fix 处理掉，推到同分支；nits 酌情
7. **人类 merge**：Claude 不做 merge，等用户确认
8. **本地清扫**：`git checkout main && git pull && git branch -d <branch> && git remote prune origin`

## Commit 规范

严格遵守 [Conventional Commits](https://www.conventionalcommits.org/)。

格式：`<type>(<scope>): <subject>`

- **type**：`feat` / `fix` / `refactor` / `docs` / `chore` / `test` / `style`
- **scope** 常用：`tracker` / `resume` / `jd` / `match` / `interview` / `store` / `prompts` / `ci`
- **subject** 中文、祈使、≤72 字符、无句号

多行 body 用 HEREDOC：

```bash
git commit -m "$(cat <<'EOF'
feat(tracker): 添加投递编辑功能

支持编辑已保存岗位的公司、岗位名、链接和备注
EOF
)"
```

不使用 `--amend`（除非用户明确要求）；pre-commit hook 失败时不加 `--no-verify`。

## 独立 CR 规范

**每个 PR 都应被一个独立子代理审阅一次**——子代理看不到我们的讨论过程，从 code-only 视角会发现我们共同忽略的东西。

**调用方式**：spawn 一个 `general-purpose` 子代理，prompt 要点：
- 明确说明审阅者视角独立、要 critical
- 提供 PR URL、分支名、基于的主线
- 列出 PR 自述内容
- 给具体的审查清单（组件结构/状态管理/UI 一致性/浏览器兼容性等）
- 要求结构化输出：**Blocking / Should-fix / Nits / Verified claims**

**CR 返回后的处理**：
- Blocking 必修；Should-fix 原则上都做
- 修完推到同分支，给审查者明确回复
- 涉及架构决策的分歧（例如"要不要合进本 PR"）先同步用户再动

## 本地验证清单

每个功能改动必须走：

- `npm run dev` — 开发服务器正常启动，页面无白屏/报错
- `npm run build` — 生产构建无报错
- 浏览器手动验证：涉及 UI 或交互逻辑的改动，在浏览器中走通 golden path

## 代码规范速查

- 所有组件使用 `<script setup>` + Composition API，不混用 Options API
- 全局状态走 `src/stores/useStore.js`，通过函数返回值获取 state 和方法
- 样式变量统一用 CSS custom properties（`var(--xxx)`），定义在 `src/assets/style.css`
- 复用已有的 css class：`.card`、`.btn`、`.btn-primary`、`.tag`、`.tag-success` 等
- 不引入新的运行时依赖
