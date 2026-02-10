import { User } from "@microservice-users/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Friendship')
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  requester: User;

  @ManyToOne(() => User)
  addressee: User;

  @Column({ default: 'pending' }) 
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED',
}