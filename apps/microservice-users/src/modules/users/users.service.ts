import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compareSync, hash } from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserRoles } from './dto/update-user-role.dto';
import { GetUserDto } from './dto/get-user.dto';
import { IUserRepository } from '../core/ports/users.port';
import { IRoleRepository } from '../core/ports/roles.port';
import { ROLE_REPO, USER_REPO } from '../core/ports/tokens';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPO)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async saveUser(user: User): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    if (!user.password || user.password.trim() === '' || user.password.length < 8) {
      throw new BadRequestException('Password must be provided and at least 8 characters long');
    }
    await this.userRepository.save(user);
  }

  async findByEmail(email: string, relations?: string[]) {
    return this.userRepository.findByEmail(email, relations);
  }

  async findByName(name: string, relations?: string[]) {
    return this.userRepository.findByName(name, relations);
  }

  async getIdbyEmail(email: string): Promise<number> {
    const userFound = await this.userRepository.findByEmail(email);
    if (!userFound) {
      throw new NotFoundException('No matching user found');
    }
    return userFound.id;
  }

  async updateRol(id: number, updateUserRol: UpdateUserRoles): Promise<string> {
    const { roles } = updateUserRol;

    const userFound = await this.userRepository.findOneBy(id);
    if (!userFound) {
      throw new NotFoundException('No matching user found');
    }

    const foundRoles = await this.roleRepository.findByCodes(roles.map((r) => r.code));

    if (!foundRoles || foundRoles.length === 0) {
      throw new NotFoundException('No matching role found');
    }

    userFound.roles = foundRoles;
    await this.userRepository.save(userFound);

    return 'Role updated successfully';
  }

  async remove(id: number) {
    const userFound = await this.userRepository.findOneBy(id);
    if (!userFound) {
      throw new NotFoundException('No matching user found');
    }
    await this.userRepository.delete(id);
    return `User deleted successfully`;
  }

  async findOneByEmailWithRolesAndPermissions(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email, ['roles', 'roles.permissions']);
    if (!user) {
      throw new NotFoundException(`User with no roles`);
    }
    return user;
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.trim() === '') {
      throw new BadRequestException('New password must be provided');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }
    const user = await this.userRepository.findOneBy(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async getUsersById(usersId: number[]): Promise<GetUserDto[]> {
    const users = await this.userRepository.findUsersById(usersId);
    return users.map((user) => ({
      name: user.name,
      email: user.email,
    }));
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    Object.assign(user, createUserDto);
    user.password = await hash(user.password, 10);
    user.description = createUserDto.description ?? '';

    const defaultRole = await this.roleRepository.findOneBy('USER');
    if (!defaultRole) {
      throw new NotFoundException('Default Role not found');
    }

    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push(defaultRole);

    try {
      await this.saveUser(user);
      return user;
    } catch (error) {
      const isDuplicateError = error.code === '23505' || error.code === 'ER_DUP_ENTRY';

      if (isDuplicateError) {
        throw new ConflictException('Email or Username already registered.');
      }

      console.error('Error creating user:', error);
      throw new HttpException('Internal server error during registration.', 500);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    let user = await this.findByEmail(loginUserDto.identifierName, ['roles']);

    if (!user) {
      user = await this.findByName(loginUserDto.identifierName, ['roles']);
    }

    if (!user) {
      throw new UnauthorizedException('User or password wrong.');
    }

    const compareResult = compareSync(loginUserDto.password, user.password);
    if (!compareResult) {
      throw new UnauthorizedException('User or password wrong');
    }

    if (!user.roles || user.roles.length === 0) {
      throw new UnauthorizedException('The user does not have a role assigned.');
    }

    return user;
  }
}
