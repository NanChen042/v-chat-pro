# Vue 前端开发接入指南 (WeChat-Style Chat)

本指南旨在帮助前端开发者快速将 Vue 项目集成到现有的 Nest.js 后端。

## 1. 环境准备

- **API 基础地址**: `http://localhost:3000`
- **WebSocket 地址**: `http://localhost:3000`
- **核心依赖**: `axios`, `socket.io-client`

---

## 2. 身份验证与用户信息

### 2.1 注册 (Register)
- **接口**: `POST /user/register`
- **参数**: `{ username, password }`

### 2.2 登录 (Login)
- **接口**: `POST /auth/login`
- **参数**: `{ username, password }`
- **返回**: 包含用户信息及 Token（如有）。目前主要使用 `id` 进行 Socket 关联。

### 2.3 获取个人信息
- **接口**: `GET /user/info?id=xxx`
- **用途**: 获取当前登录用户的个人资料（如昵称），用于界面展示。

---

## 3. 好友系统 (Friendship System)

好友工作流包含：搜索 -> 申请 -> 通知 -> 确认/拒绝 -> 同步。

### 3.1 搜索用户
- **接口**: `GET /user/search?username=xxx`

### 3.2 发起申请
- **接口**: `POST /user/friend/request`
- **参数**: `{ requesterId, addresseeId }`

### 3.3 处理申请 (同意/拒绝)
- **接口 (同意)**: `POST /user/friend/accept`
- **接口 (拒绝)**: `POST /user/friend/reject`
- **参数**: `{ userId, requestId }`

### 3.4 数据同步
- **获取好友列表**: `GET /user/friend/list?userId=xxx`
- **获取待处理申请**: `GET /user/friend/pending?userId=xxx` (用于显示红点或申请列表)

---

## 4. 实时通讯 (WebSocket)

### 4.1 连接配置
连接时必须携带 `userId` 供后端绑定 Socket：
```javascript
const socket = io('http://localhost:3000', {
  query: { userId: currentUserId }
});
```

### 4.2 接收事件 (Listen)
- `message`: 接收新消息。格式: `{ senderId, receiverId, content, createdAt }`
- `friendRequest`: 有人申请加你为好友。包含申请者 ID 和昵称。
- `friendAccepted`: 对方通过了你的好友申请。此时应刷新好友列表。
- `friendRejected`: 对方拒绝了你的好友申请。

### 4.3 发送事件 (Emit)
- `sendMessage`: 发送私聊消息。参数: `{ senderId, receiverId, content }`

---

## 5. 聊天记录 (History)

### 5.1 获取私聊历史记录
- **接口**: `GET /chat/history?user1Id=xxx&user2Id=xxx`
- **返回**: 消息数组，按时间正序排列。建议在进入对话窗口时调用。

---

## 6. 前端实现建议 (Best Practices)

1. **状态管理 (Pinia/Vuex)**:
   - 维护一个全局的 `contacts` 列表。
   - 维护一个 `pendingRequests` 数组，用于计算红点数量。
2. **红点提醒**:
   - 监听 `friendRequest` 事件时，更新 `pendingRequests` 并弹出提示。
3. **消息去重**:
   - 在 Socket 接收消息时，根据消息 ID 或时间戳防止重复渲染。
4. **自动感知**:
   - 监听到 `friendAccepted` 时，前端应自动调用 `fetchFriends` 接口静默刷新列表。

---

## 7. 常见问题 (Troubleshooting)

- **WebSocket 连接失败**: 检查后端是否启动及端口 3000 是否被占用。
- **跨域问题**: 后端已配置 CORS 允许 `*`。
- **循环依赖**: 后端开发时若修改 `User` 或 `Chat` 模块，请注意使用 `forwardRef`。
