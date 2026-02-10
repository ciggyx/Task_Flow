import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { normalizeRemoteError } from '../auth/error/normalize-remote-error';


@Injectable()
export class FriendshipService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  async create(requesterId: number, dto: CreateFriendshipDto) {
    try {
      return await firstValueFrom(
        this.usersClient.send({ cmd: 'friendship_create' }, { requesterId, email: dto.email })
      );
    } catch (error) {
      this.handleRemoteError(error);
    }
  }

  async accept(friendshipId: number, userId: number) {
    try {
      return await firstValueFrom(
        this.usersClient.send({ cmd: 'friendship_accept' }, { friendshipId, userId })
      );
    } catch (error) {
      this.handleRemoteError(error);
    }
  }

  async block(blockerId: number, dto: CreateFriendshipDto) { // dto trae el email
  try {
    return await firstValueFrom(
      this.usersClient.send(
        { cmd: 'friendship_block' }, 
        { 
          requesterId: blockerId,
          email: dto.email        
        }
      )
    );
  } catch (error) {
    this.handleRemoteError(error);
  }
}

  async findByUserId(userId: number) {
    try {
      return await firstValueFrom(
        this.usersClient.send({ cmd: 'friendship_findAllByUser' }, { userId })
      );
    } catch (error) {
      this.handleRemoteError(error);
    }
  }

  async remove(friendshipId: number, userId: number) {
    try {
      return await firstValueFrom(
        this.usersClient.send({ cmd: 'friendship_remove' }, { friendshipId, userId })
      );
    } catch (error) {
      this.handleRemoteError(error);
    }
  }


  private handleRemoteError(error: any) {
    const payload = normalizeRemoteError(error);
    throw new HttpException(
      { error: payload },
      typeof payload.status === 'number' ? payload.status : 500,
    );
  }
}