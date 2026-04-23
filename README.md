# 实时聊天系统（Vue 3 + Nest.js + Socket.io）

一个完整的前后端分离实时聊天项目，包含：
- 用户注册/登录
- 好友搜索与申请（通过/拒绝）
- 私聊消息实时收发
- 会话列表与未读数
- 已读回执（进入聊天页后清未读）

---

## 技术栈

前端（`v-chat`）：
- Vue 3 + Vite + TypeScript
- Vant + Pinia
- axios + socket.io-client

后端（`chat-server`）：
- Nest.js + TypeORM
- MySQL
- Socket.io
- JWT（登录签发）

---

## 项目结构

```text
.
├── chat-server/            # 后端 Nest 项目
├── v-chat/                 # 前端 Vue 项目
├── 后端文档.md              # 后端分阶段开发文档
├── 前端文档.md              # 前端分阶段开发文档
├── 部署文档.md              # 生产部署文档
├── 多账号测试指南.md         # 多账号联调测试说明
└── chat-test.html          # Socket 快速测试页面
```

---

## 3 分钟本地跑通

## 1) 启动 MySQL 并创建数据库
请先确保本地 MySQL 已启动，并创建数据库（默认）：

```sql
CREATE DATABASE chat_db;
```

## 2) 启动后端

进入后端目录并安装依赖：

```bash
cd chat-server
pnpm install
```

在 `chat-server` 下创建 `.env`：

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=username
DB_PASSWORD=password
DB_DATABASE=chat_db
JWT_SECRET=your_jwt_secret_key
```

启动后端：

```bash
pnpm run start:dev
```

默认监听：`http://localhost:3000`

## 3) 启动前端

新开终端：

```bash
cd v-chat
pnpm install
```

在 `v-chat` 下创建 `.env.development`：

```bash
VITE_API_BASE_URL=http://localhost:3000
```

启动前端：

```bash
pnpm dev
```

默认访问：`http://localhost:5173`

---

## 核心业务流程

1. 用户 A/B 注册并登录
2. A 搜索 B，发起好友申请
3. B 在“新的朋友”中通过申请
4. 系统自动推送通知并可发送第一条打招呼消息
5. 双方进入聊天页实时收发
6. 首页会话红点在收消息时增长
7. 进入聊天页后调用已读接口清空未读

---

## 后端主要接口

认证与用户：
- `POST /user/register`
- `POST /auth/login`
- `GET /user/info?id=xxx`
- `GET /user/search?username=xxx`

好友系统：
- `POST /user/friend/request`
- `POST /user/friend/accept`
- `POST /user/friend/reject`
- `GET /user/friend/pending?userId=xxx`
- `GET /user/friend/list?userId=xxx`

聊天：
- `GET /chat/history?user1Id=xxx&user2Id=xxx`
- `GET /chat/sessions?userId=xxx`
- `POST /chat/read`

---

## Socket 事件

前端发送：
- `sendMessage`

前端监听：
- `message`
- `friendRequest`
- `friendAccepted`
- `friendRejected`
- `error`

---

## 文档导航

- 开发后端：[`后端文档.md`](./后端文档.md)
- 开发前端：[`前端文档.md`](./前端文档.md)
- Vue 接入参考：[`Vue开发接入指南.md`](./Vue开发接入指南.md)
- 多账号联调：[`多账号测试指南.md`](./多账号测试指南.md)
- 上线部署：[`部署文档.md`](./部署文档.md)

---

## 常见问题

## 1) 前端请求失败，提示连接 localhost
检查 `v-chat/.env.development` 的 `VITE_API_BASE_URL` 是否正确。

## 2) 注册/登录报 500
检查后端 `.env` 的数据库配置、MySQL 是否启动、`chat_db` 是否存在。

## 3) 页面能请求接口，但消息不实时
检查：
- 后端是否正常启动
- Socket 是否连接到同一后端地址
- 网关 CORS 是否允许当前前端域名（线上环境）

---

## 部署

部署步骤请直接看：[`部署文档.md`](./部署文档.md)

该文档包含：
- GitHub 发布
- Render 后端部署
- Vercel 前端部署
- 环境变量模板
- 上线联调与故障排查

---

## License

本项目用于学习与演示，可按需二次开发。
