import { 
  Controller, Get, Post, Body, Patch, Param, 
  Delete, UseGuards, ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { User } from '@api-gateway/common/decorators/user.decorator';
import { FriendshipService } from './friendship.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Friendship')
@Controller('friendship') // Los Guards se quitan de aquí
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Post('request')
  @ApiOperation({ summary: 'Enviar solicitud de amistad por email' })
  @ApiResponse({ status: 201, description: 'Solicitud enviada.' })
  async createRequest(
    @User('sub') requesterId: number, 
    @Body() dto: CreateFriendshipDto
  ) {
    return await this.friendshipService.create(requesterId, dto);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Patch(':id/accept')
  @ApiOperation({ summary: 'Aceptar una solicitud de amistad' })
  async acceptFriendship(
    @Param('id', ParseIntPipe) friendshipId: number,
    @User('sub') userId: number
  ) {
    return await this.friendshipService.accept(friendshipId, userId);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Patch('/block')
  @ApiOperation({ summary: 'Bloquear a un usuario' })
  async blockUser(
    @Body() targetUserMail: CreateFriendshipDto,
    @User('sub') blockerId: number
  ) {
    return await this.friendshipService.block(blockerId, targetUserMail);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Get('my-list')
  @ApiOperation({ summary: 'Obtener lista de amigos del usuario autenticado' })
  async findMyFriendships(@User('sub') userId: number) {
    return await this.friendshipService.findByUserId(userId);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Get('my-block-list')
  @ApiOperation({ summary: 'Obtener lista de bloqueados del usuario autenticado' })
  async findMyBlockedUsers(@User('sub') userId: number) {
    return await this.friendshipService.findUsersBlockById(userId);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Delete(':id/unblock')
  @ApiOperation({ summary: 'Desbloquear a una persona' })
  async unblock(
    @Param('id', ParseIntPipe) id: number,
    @User('sub') userId: number
  ) {
    return await this.friendshipService.remove(id, userId);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una amistad o cancelar solicitud' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User('sub') userId: number
  ) {
    return await this.friendshipService.remove(id, userId);
  }

  // Este método queda sin Guards para permitir llamadas internas vía TCP/Microservicio
  @MessagePattern({ cmd: 'is_blocked' })
  async checkBlockStatus(@Payload() data: { userId: number, blockedId: number }) {
    return await this.friendshipService.isBlocked(data.userId, data.blockedId);
  }
}