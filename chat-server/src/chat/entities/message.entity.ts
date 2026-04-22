import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    // 发送者
    @ManyToOne(() => User)
    sender: User;

    @Column()
    senderId: number;

    // 接收者 (私聊)
    @ManyToOne(() => User, { nullable: true })
    receiver: User;

    @Column({ nullable: true })
    receiverId: number;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
