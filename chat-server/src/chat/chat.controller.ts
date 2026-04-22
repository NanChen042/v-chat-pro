import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('history')
    async getHistory(
        @Query('user1Id') user1Id: string,
        @Query('user2Id') user2Id: string,
    ) {
        return await this.chatService.getHistory(
            parseInt(user1Id),
            parseInt(user2Id),
        );
    }

    // 获取最近会话列表
    @Get('sessions')
    async getSessions(@Query('userId') userId: string) {
        return await this.chatService.getSessions(parseInt(userId));
    }

    // 标记已读
    @Post('read')
    async markAsRead(@Body() body: { userId: number, friendId: number }) {
        return await this.chatService.markAsRead(body.userId, body.friendId);
    }
}
