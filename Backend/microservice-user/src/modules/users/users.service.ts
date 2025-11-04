import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRepository } from './infrastructure/users.repository';
import { RoleRepository } from '../roles/infrastructure/roles.repository';
import { UpdateUserRoles } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly roleRepo: RoleRepository,
  ) {}

  async saveUser(user: User): Promise<void> {
    const existingUser = await this.userRepo.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    if (
      !user.password ||
      user.password.trim() === '' ||
      user.password.length < 8
    ) {
      throw new BadRequestException(
        'Password must be provided and at least 8 characters long',
      );
    }
    await this.userRepo.save(user);
  }

  async findByEmail(email: string, relations?: string[]) {
    return this.userRepo.findByEmail(email, relations);
  }

  async findByName(name: string, relations?: string[]) {
    return this.userRepo.findByName(name, relations);
  }

  async getIdbyEmail(email: string): Promise<number> {
    const userFound = await this.userRepo.findByEmail(email);
    if (!userFound) {
      throw new NotFoundException('No matching user found');
    }
    return userFound.id;
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
      throw new NotFoundException('No matching role found');
    }

    userFound.roles = foundRoles;
    await this.userRepo.save(userFound);

    return 'Role updated successfully';
  }

  async remove(id: number) {
    const userFound = await this.userRepo.findOneBy(id);
    if (!userFound) {
      throw new NotFoundException('No matching user found');
    }
    await this.userRepo.delete(id);
    return `User deleted successfully`;
  }

  async findOneByEmailWithRolesAndPermissions(email: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email, [
      'roles',
      'roles.permissions',
    ]);
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
      throw new BadRequestException(
        'New password must be at least 8 characters long',
      );
    }
    const user = await this.userRepo.findOneBy(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await hash(newPassword, 10);
    await this.userRepo.update(id, { password: hashedPassword });
  }
  
}
