import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend]),
    forwardRef(() => ChatModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // 导出服务以便其他模块使用
})
export class UserModule { }
