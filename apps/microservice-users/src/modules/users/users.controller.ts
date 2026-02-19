import { Controller, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserRoles } from './dto/update-user-role.dto';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { GetUserDto } from './dto/get-user.dto';
import { FriendshipService } from '../friendship/friendship.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('Bearer')
export class UsersController {
  constructor(private readonly usersService: UsersService,private readonly friendshipService: FriendshipService) {}

  @Post(':id/assignRole')
  @ApiOperation({ summary: 'Asignar o actualizar el rol de un usuario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserRoles })
  @ApiResponse({ status: 200, description: 'Rol actualizado correctamente' })
  updateRol(@Param('id') id: number, @Body() updateUserRol: UpdateUserRoles) {
    return this.usersService.updateRol(id, updateUserRol);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente' })
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }


@MessagePattern({ cmd: 'get_full_user_by_id' })
@ApiOperation({ summary: 'Obtener un usuario por su id con verificación de bloqueo' })
  async getFullUserById(@Payload() data: { id: number, userId: number }) {
  
  const isBlocked = await this.friendshipService.isBlocked(data.userId, data.id);

  if (isBlocked) {
    throw new RpcException({ 
      message: 'No tienes permiso para ver este perfil o el usuario te ha bloqueado', 
      status: 423 
    });
  }

  // 2. Buscar al usuario
  const user = await this.usersService.findOne(data.id);
  
  if (!user) {
    throw new RpcException({ 
      message: `Usuario con id ${data.id} no encontrado`, 
      status: 404 
    });
  }

  return user;
}

  @MessagePattern({ cmd: 'update_profile' })
  @ApiOperation({ summary: 'Actualizar los datos de perfil de un usuario' })
  async updateProfile(data: any) { // Usamos any o una interfaz auxiliar aquí
    const { id, ...updateData } = data; // Separamos el ID del resto de datos
    
    // Llamamos al servicio pasando (id, data)
    const user = await this.usersService.update(id, updateData);
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }


  @MessagePattern({ cmd: 'get_user_by_email' })
  @ApiOperation({ summary: 'Obtener el ID de usuario por email' })
    async getIdByEmail(data: { email: string }): Promise<number> {
      const id = await this.usersService.getIdbyEmail(data.email);
      if (!id) {
        throw new NotFoundException(`Usuario con email ${data.email} no encontrado`);
      }
      return id;
    }

  @MessagePattern({ cmd: 'get_user_by_id' })
  @ApiOperation({ summary: 'Obtener el nombre de usuario por su id' })
  async getUserById(data: { id: number }): Promise<String | null> {
    const user = await this.usersService.getUsernameById(data.id);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${data.id} no encontrado`);
    }
    return user;
  }

  @MessagePattern({ cmd: 'get_users_by_id' })
  async getUsersById(
    @Payload() ids: number[] // Quitamos 'idUsersInDashboard' para recibir el array directo
  ): Promise<GetUserDto[]> {
    return this.usersService.getUsersById(ids);
  }

  @MessagePattern({ cmd: 'get_all_users'})
  async getAllUsers(){
  return this.usersService.findAll()
}
}
