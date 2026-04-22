import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // 允许跨域
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 记录在线用户的映射关系：userId -> socketId
  private userSockets = new Map<number, string>();

  constructor(private readonly chatService: ChatService) { }

  // 当客户端连接时
  handleConnection(client: Socket) {
    // 模拟：从 query 中获取 userId (实际应从 JWT 中获取)
    const userId = parseInt(client.handshake.query.userId as string);
    if (userId) {
      this.userSockets.set(userId, client.id);
      console.log(`用户 ${userId} 已连接，SocketID: ${client.id}`);
    }
  }

  // 当客户端断开连接时
  handleDisconnect(client: Socket) {
    // 移除映射记录
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`用户 ${userId} 已断开连接`);
        break;
      }
    }
  }

  // 监听发送消息事件
  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { senderId: number, content: string, receiverId?: number }) {
    // 1. 保存消息到数据库 (内部已包含好友校验)
    const savedMessage = await this.chatService.saveMessage(data.senderId, data.content, data.receiverId);

    // 2. 定向推送
    if (data.receiverId) {
      // 发送给接收者
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('message', savedMessage);
      }
      // 同时也发给发送者自己（用于多端同步或即时回显）
      const senderSocketId = this.userSockets.get(data.senderId);
      if (senderSocketId && senderSocketId !== receiverSocketId) {
        this.server.to(senderSocketId).emit('message', savedMessage);
      }
    } else {
      // 如果没有指定接收者（比如群聊或公共频道），则广播
      this.server.emit('message', savedMessage);
    }

    return savedMessage;
  }

  // 发送系统通知（如好友申请等）
  sendNotification(userId: number, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
