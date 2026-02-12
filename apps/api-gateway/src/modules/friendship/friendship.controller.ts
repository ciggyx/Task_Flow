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


@ApiTags('Friendship')
@UseGuards(JwtRs256Guard, PermissionsGuard)
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService){
  }

  @Post('request')
  @ApiOperation({ summary: 'Enviar solicitud de amistad por email' })
  @ApiResponse({ status: 201, description: 'Solicitud enviada.' })
  async createRequest(
    @User('sub') requesterId: number, 
    @Body() dto: CreateFriendshipDto
  ) {
    return await this.friendshipService.create(requesterId, dto)
  }


  @Patch(':id/accept')
  @ApiOperation({ summary: 'Aceptar una solicitud de amistad' })
  async acceptFriendship(
    @Param('id', ParseIntPipe) friendshipId: number,
    @User('sub') userId: number
  ) {
    return await this.friendshipService.accept(friendshipId,userId)
  }

  @Patch(':userId/block')
  @ApiOperation({ summary: 'Bloquear a un usuario' })
  async blockUser(
    @Body() targetUserMail: CreateFriendshipDto,
    @User('sub') blockerId: number
  ) {
    return await this.friendshipService.block( blockerId,targetUserMail)
  }

  @Get('my-list')
  @ApiOperation({ summary: 'Obtener lista de amigos del usuario autenticado' })
  async findMyFriendships(@User('sub') userId: number) {
    return await this.friendshipService.findByUserId(userId)
  }

  @Get('my-block-list')
  @ApiOperation({ summary: 'Obtener lista de bloqueados del usuario autenticado' })
  async findMyBlockedUsers(@User('sub') userId: number) {
    return await this.friendshipService.findUsersBlockById(userId)
  }

  @Delete(':id/unblock')
  @ApiOperation({ summary: 'Desbloquear a una persona' })
  async unblock(
    @Param('id', ParseIntPipe) id: number,
    @User('sub') userId: number
  ) {
    return await this.friendshipService.remove(id, userId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una amistad o cancelar solicitud' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User('sub') userId: number
  ) {
    return await this.friendshipService.remove(id, userId)
  }
}
  