import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from '@shared/dtos';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Friendship') // Etiqueta para agrupar en Swagger
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar una solicitud de amistad' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida o ya existente.' })
  create(@Body() createFriendshipDto: CreateFriendshipDto) {
 
    return this.friendshipService.create(createFriendshipDto);
  }

  @Post('block')
  @ApiOperation({ summary: 'Bloquear a un usuario' })
  @ApiResponse({ status: 201, description: 'Usuario bloqueado exitosamente.' })
  block(@Body() dto: CreateFriendshipDto) { 
    return this.friendshipService.blockUser(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una amistad o cancelar solicitud' })
  remove(
    @Param('id') id: number,
    @Param('id') userId: number) {
    return this.friendshipService.remove(id, userId);
  }


  @MessagePattern({ cmd: 'friendship_create' })
  async handleCreate(@Payload() data: CreateFriendshipDto) {
    return await this.friendshipService.create(data);
  }

  @MessagePattern({ cmd: 'friendship_accept' })
  async handleAccept(@Payload() data: { friendshipId: number; userId: number }) {
    return await this.friendshipService.accept(data.friendshipId, data.userId);
  }

  @MessagePattern({ cmd: 'friendship_block' })
  async handleBlock(@Payload() data: CreateFriendshipDto) {
    return await this.friendshipService.blockUser(data);
  }

  @MessagePattern({ cmd: 'friendship_findAllBlockByUser' })
  async handleFindAllBlockByUser(@Payload() data: { userId: number }) {
    return await this.friendshipService.findAllBlockByUser(data.userId);
  }

  @MessagePattern({ cmd: 'friendship_findAllByUser' })
  async handleFindAllByUser(@Payload() data: { userId: number }) {
    return await this.friendshipService.findAllByUser(data.userId);
  }

  @MessagePattern({ cmd: 'friendship_remove' })
  async handleRemove(@Payload() data: {friendshipId: number, userId: number}) {
    return await this.friendshipService.remove(data.friendshipId, data.userId);
  }
  @MessagePattern({ cmd: 'is_blocked' })
  async handleIsBlocked(@Payload() data: { userId: number, blockedId: number }) {
    return await this.friendshipService.isBlocked(data.userId, data.blockedId);
  }
}