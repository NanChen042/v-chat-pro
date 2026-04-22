import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    // 验证用户登录
    async login(username: string, pass: string) {
        const user = await this.userService.findOneByUsername(username);

        // 简单演示: 实际开发应使用 bcrypt 等库比对加密后的密码
        if (user && user.password === pass) {
            const payload = { username: user.username, sub: user.id };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar
                }
            };
        }

        throw new UnauthorizedException('用户名或密码错误');
    }
}
