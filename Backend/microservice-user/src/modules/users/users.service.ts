import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './infrastructure/users.repository';
import { RoleRepository } from '../roles/infrastructure/roles.repository';
import { hashSync, compareSync } from 'bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { UpdateUserRole } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private jwtService: JwtService,
    private readonly roleRepo: RoleRepository,
  ) {}
  async register(body: CreateUserDto): Promise<{ status: string }> {
    try {
      const user = new User();
      Object.assign(user, body);
      try {
        // TODO: Corregir el error "Unsafe assignment of an error typed value."
        const hashedPassword = await hashSync(user.password, 10);
        if (typeof hashedPassword === 'string') {
          user.password = hashedPassword;
        }
      } catch (error) {
        console.error('Error hashing password:', error);
      }
      const defaultRole = await this.roleRepo.findOneBy('USER');
      if (!body.description) {
        user.description = '';
      } else {
        user.description = body.description;
      }

      if (!defaultRole) {
        throw new NotFoundException('Default Role not found');
      }

      user.rol = defaultRole;
      await this.userRepo.save(user);

      return { status: 'User succesfully created' };
    } catch (error) {
      // TODO: ¿Cómo me saco el error que me tira de que no utilizo el catch de error?
      console.log(error);
      throw new HttpException('Error in creation', 500);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepo.findByEmail(loginUserDto.email, ['rol']);

    if (user == null) {
      throw new UnauthorizedException('User or password wrong.');
    }

    // TODO: Corregir el error "Unsafe assignment of an error typed value."
    const compareResult = compareSync(loginUserDto.password, user.password);
    if (!compareResult) {
      throw new UnauthorizedException('User or password wrong');
    }

    console.log(user.rol);
    if (!user.rol) {
      console.error(
        `Error: El usuario ${user.email} no tiene un rol asignado en la base de datos.`,
      );
      throw new UnauthorizedException(
        'El usuario no tiene un rol asignado. Contacte al administrador.',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      rolId: user.rol.id,
      rolCode: user.rol.code,
    };

    return {
      accessToken: this.jwtService.generateToken(payload, 'JWT_AUTH'),
      refreshToken: this.jwtService.generateToken(payload, 'JWT_REFRESH'),
    };
  }

  async updateRol(id: number, updateUserRol: UpdateUserRole): Promise<string> {
    const { rol } = updateUserRol;

    const userFound = await this.userRepo.findOneBy(id);

    if (!userFound) {
      throw new NotFoundException('No matching user found');
    }
    const foundRol = await this.roleRepo.findOneBy(rol.code);

    if (!foundRol) {
      throw new NotFoundException('No matching rol found');
    }

    userFound.rol = foundRol;
    await this.userRepo.save(userFound);

    return 'Rol updated sucessfully';
  }

  async remove(id: number) {
    await this.userRepo.delete(id);
    return `Usuario eliminado correctamente`;
  }
}
