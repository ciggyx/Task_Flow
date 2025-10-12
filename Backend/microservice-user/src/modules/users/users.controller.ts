import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserRoles } from './dto/update-user-role.dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { Permissions } from 'src/modules/middleware/decorator/permission.decorator';
import { AuthService } from '../middleware/service.middleware';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('Bearer')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}



  @UseGuards(AuthGuard)
  @Post(':id/assignRole')
  @ApiOperation({ summary: 'Asignar o actualizar el rol de un usuario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserRoles })
  @ApiResponse({ status: 200, description: 'Rol actualizado correctamente' })
  @Permissions(['assignRole'])
  updateRol(@Param('id') id: string, @Body() updateUserRol: UpdateUserRoles) {
    return this.usersService.updateRol(Number(id), updateUserRol);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('auth/validate-permissions')
  validatePermission(
    @Headers('authorization') authorization: string,
    @Body('requiredPermissions') requiredPermissions: string[],
  ) {
    return this.authService.validateTokenAndPermissions(
      authorization,
      requiredPermissions,
    );
  }

  @Post('getIdbyEmail')
  @ApiOperation({ summary: 'Obtener el ID de usuario por email' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  async getIdByEmail(@Body('email') email: string) {
    return await this.usersService.getIdbyEmail(email);
  }
}
