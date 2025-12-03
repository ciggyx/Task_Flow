import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permissions } from '@microservice-users/modules/middleware/decorator/permission.decorator';

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth('Bearer')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un rol nuevo' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: Role,
  })
  @Permissions(['createRole'])
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles', type: [Role] })
  @Permissions(['getRole'])
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rol encontrado', type: Role })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Permissions(['getRole'])
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol existente (campos opcionales)' })
  @ApiParam({
    name: 'id',
    description: 'ID del rol a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({
    description: 'Campos opcionales para actualizar el rol',
    type: UpdateRoleDto,
    examples: {
      actualizarNombre: {
        summary: 'Solo actualizar el nombre',
        value: { name: 'Nuevo nombre' },
      },
      actualizarDescripcion: {
        summary: 'Solo actualizar descripción',
        value: { description: 'Rol solo para supervisores' },
      },
      actualizarPermisos: {
        summary: 'Actualizar permisos',
        value: { permissions: [{ id: 1 }, { id: 2 }] },
      },
      actualizarTodo: {
        summary: 'Actualizar todos los campos',
        value: {
          code: 'SUPERVISOR',
          name: 'Supervisor',
          description: 'Rol para supervisores de área',
          permissions: [{ id: 2 }, { id: 3 }],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado correctamente',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol o permisos no encontrados',
  })
  @Permissions(['updateRole'])
  update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rol eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Permissions(['deleteRole'])
  remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }
}
