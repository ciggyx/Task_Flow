import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Friendship, FriendshipStatus } from '@microservice-users/modules/friendship/entities/friendship.entity';
import { IFriendshipRepository } from '@microservice-users/modules/core/ports/friendship.port'; 

@Injectable()
export class FriendshipRepository implements IFriendshipRepository {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  async create(friendship: Friendship): Promise<Friendship> {
    return this.friendshipRepository.save(friendship);
  }

  async findAll(): Promise<Friendship[]> {
    return this.friendshipRepository.find({ relations: ['requester', 'addressee'] });
  }

  async findById(id: number): Promise<Friendship | null> {
    return this.friendshipRepository.findOne({ 
        where: { id },
        relations: ['requester', 'addressee'] 
    });
  }

  async findByUsers(userA: number, userB: number): Promise<Friendship | null> {
    return this.friendshipRepository.findOne({
      where: [
        { requester: { id: userA }, addressee: { id: userB } },
        { requester: { id: userB }, addressee: { id: userA } },
      ],
    });
  }

  async update(friendship: Friendship): Promise<Friendship> {
    return this.friendshipRepository.save(friendship);
  }

  async remove(friendship: Friendship): Promise<void> {
    await this.friendshipRepository.remove(friendship);
  }


  async findAllByUser(userId: number): Promise<Friendship[]> {
      return await this.friendshipRepository.find({
        where: [
          { requester: { id: userId }, status: Not(FriendshipStatus.BLOCKED) },
          { addressee: { id: userId }, status: Not(FriendshipStatus.BLOCKED) }
        ],
        relations: ['requester', 'addressee'],
        order: { createdAt: 'DESC' }
      });
    }
  async findBlockedByUser(userId: number): Promise<Friendship[]|null> {
    return await this.friendshipRepository.find({
      where: {
        requester: { id: userId },
        status: FriendshipStatus.BLOCKED
      },
      relations: ['addressee'],
      order: { createdAt: 'DESC' }
    });
  }

  async isBlocked(userId1: number, userId2: number): Promise<boolean> {
    const block = await this.friendshipRepository.findOne({
      where: [
        { 
          requester: { id: userId1 }, // Use the relation name 'requester'
          addressee: { id: userId2 }, 
          status: 'BLOCKED' 
        },
        { 
          requester: { id: userId2 }, 
          addressee: { id: userId1 }, 
          status: 'BLOCKED' 
        }
      ]
    });

    return !!block;
  }
}