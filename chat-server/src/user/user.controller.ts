import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { FriendStatus } from './entities/friend.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() userData: Partial<User>) {
        return await this.userService.create(userData);
    }
    // 获取用户信息
    @Get('info')
    async getInfo(@Query('id') id: string) {
        return await this.userService.findOneById(parseInt(id));
    }

    // 搜索用户
    @Get('search')
    async search(@Query('username') username: string) {
        return await this.userService.searchUsers(username);
    }

    // 发起好友申请
    @Post('friend/request')
    async sendRequest(@Body() body: { requesterId: number, addresseeId: number }) {
        return await this.userService.sendFriendRequest(body.requesterId, body.addresseeId);
    }

    // 同意好友申请
    @Post('friend/accept')
    async acceptRequest(@Body() body: { userId: number, requestId: number }) {
        return await this.userService.handleFriendRequest(body.userId, body.requestId, FriendStatus.ACCEPTED);
    }

    // 拒绝好友申请
    @Post('friend/reject')
    async rejectRequest(@Body() body: { userId: number, requestId: number }) {
        return await this.userService.handleFriendRequest(body.userId, body.requestId, FriendStatus.REJECTED);
    }

    // 获取待处理申请
    @Get('friend/pending')
    async getPending(@Query('userId') userId: string) {
        return await this.userService.getPendingRequests(parseInt(userId));
    }

    // 获取好友列表
    @Get('friend/list')
    async getFriends(@Query('userId') userId: string) {
        return await this.userService.getFriendList(parseInt(userId));
    }
}
