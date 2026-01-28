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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetUserDto } from './dto/get-user.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('Bearer')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':id/assignRole')
  @ApiOperation({ summary: 'Asignar o actualizar el rol de un usuario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserRoles })
  @ApiResponse({ status: 200, description: 'Rol actualizado correctamente' })
  updateRol(@Param('id') id: string, @Body() updateUserRol: UpdateUserRoles) {
    return this.usersService.updateRol(Number(id), updateUserRol);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
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
    @ApiOperation({ summary: 'Obtener un array de usuarios por sus IDs' })
    async getUsersById(
    
    @Payload('idUsersInDashboard') ids: number[]
    ): Promise<GetUserDto[]> {
    return this.usersService.getUsersById(ids);
    }
}
