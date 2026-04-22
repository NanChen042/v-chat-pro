import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum FriendStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    requesterId: number;

    @Column()
    addresseeId: number;

    @Column({
        type: 'enum',
        enum: FriendStatus,
        default: FriendStatus.PENDING,
    })
    status: FriendStatus;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requesterId' })
    requester: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'addresseeId' })
    addressee: User;
}
