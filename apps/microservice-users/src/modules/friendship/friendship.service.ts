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
  // 1. Verificación de existencia (Regla de negocio)
    const userExists = await this.userRepository.findOneBy(userId);
    if (!userExists) {
      throw new NotFoundException(`El usuario con ID #${userId} no existe.`);
    }

    // 2. El repositorio ya devuelve solo lo que NO está bloqueado
    const friendships = await this.friendshipRepository.findAllByUser(userId);

    if (!friendships || friendships.length === 0) {
    return []; 
    }

    // 3. Mapeo simple
    return friendships.map((f) => {
      // Determinamos quién es el "amigo"
      const isRequester = f.requester.id === userId;
      const otherUser = isRequester ? f.addressee : f.requester;

      return {
        friendshipId: f.id,
        status: f.status,
        friendshipDate: f.createdAt,
        friend: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
        }
      };
    });
  }

  async findAllBlockByUser(userId: number) {
  // 1. Llamada al repo que busca solo donde YO soy el requester y el status es BLOCKED
  const blockedFriendships = await this.friendshipRepository.findBlockedByUser(userId);

  // 2. Si es null o vacío, devolvemos array vacío (más estándar que 404)
  if (!blockedFriendships || blockedFriendships.length === 0) {
    return []; 
  }

  return blockedFriendships.map(f => ({
    friendshipId: f.id,
    status: f.status,
    blockedUser: {
      id: f.addressee.id, // El bloqueado siempre será el addressee en este contexto
      name: f.addressee.name,
      email: f.addressee.email
    }
  }));
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


  const userToBlock = await this.userRepository.findByEmail(email);


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


  if (existing) {

    existing.status = FriendshipStatus.BLOCKED;
    existing.requester = { id: requesterId } as User;
    existing.addressee = { id: userToBlock.id } as User;
    
    return this.friendshipRepository.update(existing);
  } else {
    const blockRelation = new Friendship();
    blockRelation.requester = { id: requesterId } as User;
    blockRelation.addressee = { id: userToBlock.id } as User;
    blockRelation.status = FriendshipStatus.BLOCKED;
    return this.friendshipRepository.create(blockRelation);
  }
}
}