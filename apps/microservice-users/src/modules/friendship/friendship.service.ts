import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IFriendshipRepository } from '@microservice-users/modules/core/ports/friendship.port';
import { Friendship, FriendshipStatus } from './entities/friendship.entity';
import { User } from '../users/entities/user.entity';
import { CreateFriendshipDto } from '@shared/dtos';
import { FRIENDSHIP_REPO, USER_REPO } from '../core/ports/tokens';
import { IUserRepository } from '../core/ports/users.port';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class FriendshipService {
  private readonly logger = new Logger(FriendshipService.name);
  constructor(
    @Inject(FRIENDSHIP_REPO)
    private readonly friendshipRepository: IFriendshipRepository,
    @Inject(USER_REPO)
    private readonly userRepository: IUserRepository,
    @Inject('GATEWAY_CLIENT')
    private readonly gatewayClient: ClientProxy,
  ) {}

  async create(createFriendshipDto: CreateFriendshipDto) {
    const { requesterId, email } = createFriendshipDto;

    // 1. Validaciones de negocio (lo que ya tienes)
    const addressee = await this.userRepository.findByEmail(email);
    if (!addressee) throw new NotFoundException(`User with email ${email} not found`);
    const requester = await this.userRepository.findOneBy(requesterId);
    if (!requester) throw new NotFoundException(`Requester with ID #${requesterId} not found`);
    if (requesterId === addressee.id) throw new BadRequestException('No puedes enviarte una solicitud a ti mismo');
    
    const existing = await this.friendshipRepository.findByUsers(requesterId, addressee.id);
    if (existing) throw new BadRequestException('Ya existe una relación o bloqueo');

    // 2. Persistencia
    const friendship = new Friendship();
    friendship.requester = { id: requesterId } as User;
    friendship.addressee = { id: addressee.id } as User;
    friendship.status = FriendshipStatus.PENDING;

    const savedFriendship = await this.friendshipRepository.create(friendship);

    // 3. Notificación Sincrónica (usando send para esperar respuesta)
    try {
      const notificationPayload: CreateNotificationDto = {
        userId: addressee.id,
        type: 'FRIEND_REQUEST',
        title: 'Nueva solicitud de amistad',
        message: `Has recibido una solicitud de amistad de ${requester.name}`,
        relatedResourceId: savedFriendship.id
      };

      await firstValueFrom(
        this.gatewayClient.send({ cmd: 'create_notification' }, notificationPayload)
      );
    } catch (error) {
      this.logger.error(`No se pudo notificar al usuario ${addressee.id}: ${error.message}`);
    }

    return savedFriendship;
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
    // 1. Verificación de existencia
    const userExists = await this.userRepository.findOneBy(userId);
    if (!userExists) {
      throw new NotFoundException(`El usuario con ID #${userId} no existe.`);
    }

    // 2. Obtención de amistades
    const friendships = await this.friendshipRepository.findAllByUser(userId);

    if (!friendships || friendships.length === 0) {
      return []; 
    }

    // 3. Mapeo con la nueva propiedad sentByMe
    return friendships.map((f) => {
      // Determinamos si el usuario actual fue quien envió la solicitud
      const isSentByMe = f.requester.id === userId;
      
      // El "amigo" es el que NO soy yo
      const otherUser = isSentByMe ? f.addressee : f.requester;

      return {
        friendshipId: f.id,
        status: f.status,
        friendshipDate: f.createdAt,
        sentByMe: isSentByMe, // <--- Booleano clave para el frontend
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
    friend: {
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

  async isBlocked(userId: number, blockedId: number): Promise<Boolean> {
    return await this.friendshipRepository.isBlocked(userId, blockedId);
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