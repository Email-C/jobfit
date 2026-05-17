<h1 align="center">
  <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" width="80" />
  <br>JobFit — AI 求职准备助手
</h1>

<p align="center">
  <strong>从 JD 到 Offer 的 AI 驱动求职工作台</strong>
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> ·
  <a href="#核心功能">核心功能</a> ·
  <a href="#为什么做这个">为什么做这个</a> ·
  <a href="#贡献">贡献</a>
</p>

---

## 这是什么

JobFit 是一个**纯前端、零 API 成本的 AI 求职准备工具**。它不会替你调用 AI，而是帮你组织上下文、提供经过验证的专业 Prompt 模板，让你在 ChatGPT/Claude/DeepSeek 等任何 AI 工具中获得更精准的求职分析结果。

**核心思路：** 你提供 JD 和简历 → JobFit 拼接最佳 Prompt → 你复制到任意 AI 工具 → 结果粘贴回来 → JobFit 帮你管理全流程。

## 解决什么问题

求职者面对每个岗位都需要重复做三件事：分析 JD、匹配自身优劣势、准备面试。直接问 AI 的问题在于——每次都要重新描述自己的背景、每次都要从零写 Prompt、每次结果都散落在聊天记录里无法管理。

JobFit 的核心价值：
- **一次填写简历，所有岗位复用** —— 不用每次都向 AI 重新介绍自己
- **专业 Prompt 模板** —— 由 AI 产品经理基于实际招聘场景打磨的结构化 Prompt，输出质量远超随手写的
- **全流程追踪** —— JD 解析 → 人岗匹配 → 面试准备 → 投递进度，一个工具闭环

## 核心功能

### 🔍 JD 智能解析
粘贴职位描述 → 一键生成结构化分析 Prompt → 获得：核心要求、隐性期待、关键词、岗位画像

### 🎯 人岗匹配
选择目标岗位 + 你的简历 → 生成匹配分析 Prompt → 6维雷达图数据、强匹配点、关键差距、Gap弥补计划

### 💡 面试准备
选择目标岗位 → 生成面试准备 Prompt → 行为面/技术面/情景题 + 反问建议 + 考前Checklist

### 📊 投递追踪
全流程可视化管理：待投递 → 已投递 → 面试中 → Offer → 转化漏斗分析

## 为什么开源

1. **Prompt 模板需要社区共建** —— 不同行业、不同岗位的 JD 分析角度各不相同，需要大家一起贡献
2. **数据完全本地** —— 你的简历和投递记录存在浏览器的 localStorage 中，不上传任何服务器
3. **零成本使用** —— 不依赖任何 AI API，你用自己的免费 AI 工具就能跑通全流程

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Vue 3 + Composition API |
| 构建 | Vite |
| 存储 | 浏览器 localStorage（数据完全本地） |
| 部署 | GitHub Pages（免费静态托管） |
| AI 能力 | 预置 Prompt 模板 + 用户自带 AI 工具 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 使用流程

```
1. 填写「我的简历」 → 教育背景、技能、实习/项目经历
2. 打开「JD解析」 → 粘贴目标岗位 JD → 复制Prompt → 带到AI工具
3. AI分析完 → 粘贴回JobFit → 保存到JD库
4. 打开「人岗匹配」 → 选择岗位 → 复制匹配Prompt → 带到AI工具
5. 打开「面试准备」 → 选择岗位 → 复制面试Prompt → 带到AI工具
6. 在「投递追踪」中管理所有岗位的进度
```

## Roadmap

- [x] MVP v0.1：JD解析 + 人岗匹配 + 面试准备 + 投递追踪
- [ ] Chrome 插件版（一键提取网页JD）
- [ ] Prompt 模板市场（用户贡献 + 评分）
- [ ] 多简历管理（不同岗位用不同版本简历）
- [ ] 导出面试准备方案为 PDF/Markdown
- [ ] 社区共享 JD 分析结果（脱敏后）
- [ ] 可选接入 AI API（一键自动分析，无需手动复制）

## 贡献

欢迎贡献！两种方式：

1. **贡献 Prompt 模板** —— `src/prompts/templates.js` 中添加你的场景模板并提 PR
2. **贡献功能代码** —— 查看 Roadmap 或 Issues，选一个感兴趣的动手

请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

MIT © 2025 JobFit Contributors
