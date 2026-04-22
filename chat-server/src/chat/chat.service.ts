import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) { }

    // 保存消息到数据库
    async saveMessage(senderId: number, content: string, receiverId?: number): Promise<Message> {
        // 如果有接收者，校验好友关系
        if (receiverId) {
            const isFriend = await this.userService.checkFriendship(senderId, receiverId);
            if (!isFriend) {
                throw new ForbiddenException('你们还不是好友，无法发送消息');
            }
        }

        const message = this.messageRepository.create({
            senderId,
            content,
            receiverId
        });
        return await this.messageRepository.save(message);
    }

    // 获取两个好友之间的历史记录
    async getHistory(user1Id: number, user2Id: number): Promise<Message[]> {
        return await this.messageRepository.find({
            where: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id },
            ],
            order: { createdAt: 'ASC' },
        });
    }

    // 获取最近会话列表
    async getSessions(userId: number): Promise<any[]> {
        // 查找所有与该用户相关的消息
        const messages = await this.messageRepository.find({
            where: [
                { senderId: userId },
                { receiverId: userId },
            ],
            order: { createdAt: 'DESC' },
        });

        const sessionsMap = new Map<number, any>();

        for (const msg of messages) {
            const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!otherId) continue;

            if (!sessionsMap.has(otherId)) {
                const otherUser = await this.userService.findOneById(otherId);
                if (!otherUser) continue;

                // 计算未读数：该会话中 receiver 是当前用户且 isRead 为 false 的消息
                const unreadCount = await this.messageRepository.count({
                    where: {
                        senderId: otherId,
                        receiverId: userId,
                        isRead: false
                    }
                });

                sessionsMap.set(otherId, {
                    user: {
                        id: otherUser.id,
                        username: otherUser.username,
                        avatar: otherUser.avatar,
                    },
                    lastMessage: msg.content,
                    updatedAt: msg.createdAt,
                    unreadCount: unreadCount,
                });
            }
        }

        return Array.from(sessionsMap.values());
    }

    // 标记消息为已读
    async markAsRead(userId: number, friendId: number) {
        return await this.messageRepository.update(
            { senderId: friendId, receiverId: userId, isRead: false },
            { isRead: true }
        );
    }
}
