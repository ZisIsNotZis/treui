[English](README.md) · **简体中文**

<p align="center">
  <img src="assets/logo.svg" width="88" height="88" alt="treui logo">
</p>

<h1 align="center">treui</h1>

<p align="center"><strong>能拖拽分叉的对话画布。</strong></p>

<p align="center">用 Vue 3 和 vis-network 搭起来的节点图聊天界面。</p>

每个气泡是一条消息，每条连线是一段上下文。把一个气泡拖到另一个气泡上，
对话就多出一条分支；从根到当前节点的祖先链，就是下一次请求的提示词。

> **状态：** 归档原型，仅作参考，不再主动维护。

## 快速开始

需要 Node.js 16 以上，以及一个运行在 `http://localhost:8080` 的 OpenAI 兼容服务。
这个地址写死在 [`GraphCanvas.vue`](src/components/GraphCanvas.vue) 里，目前没有环境变量。
先把 API 服务启动起来，然后执行：

```bash
npm ci
npm run serve
```

开发服务器会占用第一个空闲端口；8080 被 API 服务占着时会自动顺延。
`npm run build` 会把静态文件输出到 `dist/`。

## 现在能做什么

- **无限画布。** 在 `vis-network` 图上自由平移、缩放、摆放聊天气泡。
- **新建与编辑。** 双击空白处新建气泡；双击气泡编辑内容和元数据。
- **拖拽分叉。** 把一个气泡拖到另一个气泡上建立父子连线。被拖的气泡会弹回原位，
  目标节点则在 user 和 assistant 之间切换。
- **删除整棵子树。** 选中气泡后按 <kbd>Delete</kbd>，它的后代一起删除。
- **按上下文生成。** 没有内容、但至少有一个父节点的气泡，会流式请求
  `/v1/chat/completions`；提示词由祖先节点依次拼成。
- **节点级采样参数。** 元数据按空格分隔的 `key=value` 解析（默认
  `max_token=256`），然后展开进请求体。
- **实时输出。** 流式返回的增量会边到边写进气泡里。

## 架构

```text
src/
├── App.vue                    应用外壳
├── components/GraphCanvas.vue 画布、编辑、生成、图状态
├── api.js                     没被引用的 axios 原型
└── main.js                    Vue 入口
public/index.html              HTML 外壳
vue.config.js                  Vue CLI 5 配置
```

整个应用集中在 `GraphCanvas.vue`：vis-network 的 `DataSet`、编辑弹窗、拖拽连线、
子树删除和流式 `fetch` 循环都在这里。图本身就是聊天状态——一个节点是一条消息，
指向它的边是它的上下文，父节点依次变成 `messages` 数组。所有数据都只在内存里，
刷新页面画布就清空；没有后端，也没有持久化。

`src/api.js` 是没被引用的 axios 原型，`cytoscape` / `cytoscape-dagre`
声明了依赖却从未 import。它们都是待清理项，不参与当前流程。

## 开发方式

```bash
npm ci          # 安装依赖
npm run serve   # 带热更新的开发服务器
npm run lint    # 通过 vue-cli-service 跑 ESLint
npm run build   # 生产构建，输出到 dist/
```

项目在 Vue CLI 5 脚手架里使用 Vue 3 Composition API。Vue CLI 上游已进入维护模式，
迁移到 Vite 属于后续工作。仓库没有测试，也没有 CI。

## 如何贡献

这个仓库是归档状态，但欢迎针对明确问题的修复。较大的改动请先开 issue 讨论方向。
改动尽量小，说清楚问题和复现方式，提交前跑一遍 `npm run lint`，不要提交
`dist/`、`node_modules/` 或本地环境文件。贡献按 AGPL-3.0-only 许可接受。

## 路线图

### 已实现

- 可平移、缩放、拖动气泡的无限画布
- 新建、编辑、连接、删除气泡与子树
- 父节点链 → 提示词 → 流式 OpenAI 兼容补全
- 节点级 `key=value` 元数据展开进请求体

### 计划中

以下只是重启项目时的想法，不是承诺——仓库目前处于归档状态。

- 把 API 地址和默认模型移到配置或环境变量里
- 支持保存、读取、导出 JSON 图谱，补上持久化
- 删掉未使用的 axios helper 和 cytoscape 依赖
- 从 Vue CLI 5 迁移到 Vite
- 给 SSE 解析、子树删除、重复连线补测试
- 显示请求错误，并支持取消流式请求
- 并排比较兄弟分支的回答

## 未来设想

如果重新启动这个项目，值得做的不是继续堆聊天功能，而是把「对话的拓扑」变成真正
可编辑的一等对象：并排开分支、比较不同回答、把一棵子树折叠成摘要，最后把整张图
导出成可复用的提示词。现在这 200 行左右的原型，只是这个想法的一张草图。

## 许可证

AGPL-3.0-only，详见 [`LICENSE`](LICENSE)。项目备注在
[`docs/project-status.md`](docs/project-status.md)。
