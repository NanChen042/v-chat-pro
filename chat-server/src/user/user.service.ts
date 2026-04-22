import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Friend, FriendStatus } from './entities/friend.entity';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Friend)
        private friendRepository: Repository<Friend>,
        @Inject(forwardRef(() => ChatGateway))
        private chatGateway: ChatGateway,
    ) { }

    // 根据用户名查找用户
    async findOneByUsername(username: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { username } });
    }

    // 创建新用户 (注册)
    async create(userData: Partial<User>): Promise<User> {
        if (!userData) {
            throw new HttpException('请求体不能为空', HttpStatus.BAD_REQUEST);
        }
        const { username } = userData;

        if (!username) {
            throw new HttpException('用户名不能为空', HttpStatus.BAD_REQUEST);
        }

        // 检查用户是否已存在
        const existingUser = await this.findOneByUsername(username);
        if (existingUser) {
            throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
        }

        const newUser = this.userRepository.create(userData);
        return await this.userRepository.save(newUser);
    }

    // 根据ID查找用户
    async findOneById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    // 搜索用户
    async searchUsers(username: string): Promise<User[]> {
        return this.userRepository.find({
            where: { username: username }, // 简单实现，后续可改为模糊查询
            select: ['id', 'username', 'avatar'],
        });
    }

    // 发送好友申请
    async sendFriendRequest(requesterId: number, addresseeId: number) {
        if (requesterId === addresseeId) {
            throw new HttpException('不能给自己发申请', HttpStatus.BAD_REQUEST);
        }
        const existing = await this.friendRepository.findOne({
            where: [
                { requesterId, addresseeId },
                { requesterId: addresseeId, addresseeId: requesterId },
            ],
        });
        if (existing) {
            if (existing.status === FriendStatus.ACCEPTED) {
                throw new HttpException('你们已经是好友了', HttpStatus.BAD_REQUEST);
            }
            if (existing.status === FriendStatus.PENDING) {
                throw new HttpException('申请已存在，请等待对方回复', HttpStatus.BAD_REQUEST);
            }
            // 如果是已拒绝状态，则删除旧记录，允许重新发起
            await this.friendRepository.remove(existing);
        }
        const request = this.friendRepository.create({ requesterId, addresseeId });
        const saved = await this.friendRepository.save(request);

        // 发送通知给被申请者
        const requester = await this.findOneById(requesterId);
        if (requester) {
            this.chatGateway.sendNotification(addresseeId, 'friendRequest', {
                requestId: saved.id,
                requesterId: requester.id,
                requesterName: requester.username
            });
        }

        return saved;
    }

    // 处理好友申请 (同意/拒绝)
    async handleFriendRequest(userId: number, requestId: number, status: FriendStatus) {
        const request = await this.friendRepository.findOne({
            where: { id: requestId },
            relations: ['requester', 'addressee']
        });
        if (!request || request.addresseeId !== userId) {
            throw new HttpException('未找到申请或无权操作', HttpStatus.FORBIDDEN);
        }
        request.status = status;
        const saved = await this.friendRepository.save(request);

        if (status === FriendStatus.ACCEPTED) {
            // 通知申请人，申请已被通过
            this.chatGateway.sendNotification(saved.requesterId, 'friendAccepted', {
                friendId: saved.addresseeId,
                friendName: saved.addressee.username
            });
        } else if (status === FriendStatus.REJECTED) {
            // 通知申请人，申请被拒绝
            this.chatGateway.sendNotification(saved.requesterId, 'friendRejected', {
                friendId: saved.addresseeId,
                friendName: saved.addressee.username
            });
        }

        return saved;
    }

    // 获取好友列表
    async getFriendList(userId: number) {
        const friends = await this.friendRepository.find({
            where: [
                { requesterId: userId, status: FriendStatus.ACCEPTED },
                { addresseeId: userId, status: FriendStatus.ACCEPTED },
            ],
            relations: ['requester', 'addressee'],
        });

        // 提取好友的基本信息
        return friends.map(f => {
            return f.requesterId === userId ? f.addressee : f.requester;
        });
    }

    // 校验好友关系
    async checkFriendship(user1Id: number, user2Id: number): Promise<boolean> {
        const friendship = await this.friendRepository.findOne({
            where: [
                { requesterId: user1Id, addresseeId: user2Id, status: FriendStatus.ACCEPTED },
                { requesterId: user2Id, addresseeId: user1Id, status: FriendStatus.ACCEPTED },
            ],
        });
        return !!friendship;
    }

    // 获取待处理的好友申请
    async getPendingRequests(userId: number) {
        return await this.friendRepository.find({
            where: { addresseeId: userId, status: FriendStatus.PENDING },
            relations: ['requester'],
        });
    }
}
