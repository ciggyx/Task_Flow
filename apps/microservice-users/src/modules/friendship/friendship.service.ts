import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFriendshipRepository } from '@microservice-users/modules/core/ports/friendship.port';
import { Friendship, FriendshipStatus } from './entities/friendship.entity';
import { User } from '../users/entities/user.entity';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { FRIENDSHIP_REPO, USER_REPO } from '../core/ports/tokens';
import { IUserRepository } from '../core/ports/users.port';

@Injectable()
export class FriendshipService {
  constructor(
    @Inject(FRIENDSHIP_REPO)
    private readonly friendshipRepository: IFriendshipRepository,
    @Inject(USER_REPO)
    private readonly userRepository: IUserRepository,
  ) {}

  async create(createFriendshipDto: CreateFriendshipDto) { // Ajusta al DTO que uses en el MS
    const { requesterId, email } = createFriendshipDto;

    const addressee = await this.userRepository.findByEmail(email);

    if (!addressee) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (requesterId === addressee.id) {
      throw new BadRequestException('No puedes enviarte solicitud a ti mismo');
    }

    const existing = await this.friendshipRepository.findByUsers(requesterId, addressee.id);
    
    if (existing) {
      if (existing.status === FriendshipStatus.BLOCKED) {
        throw new BadRequestException('No puedes enviar solicitud, el usuario está bloqueado o te bloqueó.');
      }
      throw new BadRequestException('Ya existe una solicitud o amistad con este usuario');
    }

    const friendship = new Friendship();
    friendship.requester = { id: requesterId } as User;
    friendship.addressee = { id: addressee.id } as User;
    friendship.status = FriendshipStatus.PENDING;

    return this.friendshipRepository.create(friendship);
  }

  async accept(friendshipId: number, userId: number) {
  const friendship = await this.friendshipRepository.findById(friendshipId);

  if (!friendship) {
    throw new NotFoundException(`La solicitud #${friendshipId} no existe.`);
  }

  if (friendship.addressee.id !== userId) {
    throw new ForbiddenException('Solo el destinatario puede aceptar esta solicitud.');
  }

  if (friendship.status !== FriendshipStatus.PENDING) {
    throw new BadRequestException(`No se puede aceptar una solicitud en estado: ${friendship.status}`);
  }

  friendship.status = FriendshipStatus.ACCEPTED;
  
  return await this.friendshipRepository.update(friendship);
}

  async findAllByUser(userId: number) {

    const userExists = await this.userRepository.findOneBy( userId );
    if (!userExists) {
      throw new NotFoundException(`El usuario con ID #${userId} no existe.`);
    }

    const friendships = (await this.friendshipRepository.findAllByUser(userId)) ?? [];

    return friendships
      .filter(f => f.status !== FriendshipStatus.BLOCKED)
      .map((f) => {
        if (!f.requester || !f.addressee) return null;

        const isRequester = f.requester.id === userId;
        const otherUser = isRequester ? f.addressee : f.requester;

        return {
          friendshipId: f.id,
          status: f.status,
          friendshipDate: f.createdAt,
          friend: {
            name: otherUser.name,
            email: otherUser.email,
          }
        };
      })
      .filter(item => item !== null); 
  }

  async findOne(id: number) {
    const friendship = await this.friendshipRepository.findById(id);
    if (!friendship) throw new NotFoundException(`Friendship #${id} not found`);
    return friendship;
  }


  async remove(friendshipId: number, userId: number) {
    const friendship = await this.friendshipRepository.findById(friendshipId);

    if (!friendship) {
      throw new NotFoundException(`Friendship with ID #${friendshipId} not found`);
    }

    if (friendship.requester.id !== userId && friendship.addressee.id !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta relación');
    }

    await this.friendshipRepository.remove(friendship);
    
    return { success: true, message: `Friendship #${friendshipId} removed` };
  }

  async blockUser(createFriendshipDto: CreateFriendshipDto) {
  const { requesterId, email } = createFriendshipDto;

  console.log(requesterId, email)

  const userToBlock = await this.userRepository.findByEmail(email);

  console.log(userToBlock)

  // 1. Verificación de existencia
  if (!userToBlock) {
    throw new NotFoundException(`User with email ${email} not found`);
  }

  // 2. Verificación de auto-bloqueo
  if (requesterId === userToBlock.id) {
    throw new BadRequestException('No puedes bloquearte a ti mismo');
  }

  // 3. Buscar si ya existe alguna relación (amigos, pendiente o rechazado)
  const existing = await this.friendshipRepository.findByUsers(requesterId, userToBlock.id);

  console.log(existing)

  if (existing) {
    // Si ya existe, forzamos el estado a BLOCKED.
    // Importante: El 'requester' ahora es quien ejecuta el bloqueo.
    existing.status = FriendshipStatus.BLOCKED;
    existing.requester = { id: requesterId } as User;
    existing.addressee = { id: userToBlock.id } as User;
    
    return this.friendshipRepository.update(existing);
  } else {
    // Si no existe, creamos la entidad desde cero.
    const blockRelation = new Friendship();
    blockRelation.requester = { id: requesterId } as User;
    blockRelation.addressee = { id: userToBlock.id } as User;
    blockRelation.status = FriendshipStatus.BLOCKED;

    return this.friendshipRepository.create(blockRelation);
  }
}
}