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
import { compareSync, hash } from 'bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { UpdateUserRoles } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private jwtService: JwtService,
    private readonly roleRepo: RoleRepository,
  ) {}
  async register(body: CreateUserDto): Promise<{ status: string }> {
    const user = new User();
    Object.assign(user, body);
    user.password = await hash(user.password, 10);
    user.description = body.description ?? '';

    const defaultRole = await this.roleRepo.findOneBy('USER');
    if (!defaultRole) {
      throw new NotFoundException('Default Role not found');
    }

    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push(defaultRole);

    try {
      await this.userRepo.save(user);
      return { status: 'User successfully created' };
    } catch (error) {
      console.error('Error saving user:', error);
      throw new HttpException('Error creating user', 500);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepo.findByEmail(loginUserDto.email, ['roles']);

    if (user == null) {
      throw new UnauthorizedException('User or password wrong.');
    }

    const compareResult = compareSync(loginUserDto.password, user.password);
    if (!compareResult) {
      throw new UnauthorizedException('User or password wrong');
    }

    if (!user.roles || user.roles.length === 0) {
      console.error(
        `Error: User ${user.email} does not have a role assigned in the database.`,
      );
      throw new UnauthorizedException(
        'The user does not have a role assigned.',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      rolesId: user.roles.map((r) => r.id),
      rolesCode: user.roles.map((r) => r.code),
    };

    return {
      accessToken: this.jwtService.generateToken(payload, 'JWT_AUTH'),
      refreshToken: this.jwtService.generateToken(payload, 'JWT_REFRESH'),
    };
  }

  async updateRol(id: number, updateUserRol: UpdateUserRoles): Promise<string> {
    const { roles } = updateUserRol;

    const userFound = await this.userRepo.findOneBy(id);

    if (!userFound) {
      throw new NotFoundException('No matching user found');
    }
    const foundRoles = await this.roleRepo.findByCodes(
      roles.map((r) => r.code),
    );

    if (!foundRoles || foundRoles.length === 0) {
      throw new NotFoundException('No matching rol found');
    }

    userFound.roles = foundRoles;
    await this.userRepo.save(userFound);

    return 'Rol updated sucessfully';
  }

  async remove(id: number) {
    await this.userRepo.delete(id);
    return `User deleted sucessfully`;
  }

  async findOneByEmailWithRolesAndPermissions(email: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email, [
      'roles',
      'roles.permissions',
    ]);

    if (!user) {
      throw new Error(`User with no roles`);
    }
    return user;
  }
}
