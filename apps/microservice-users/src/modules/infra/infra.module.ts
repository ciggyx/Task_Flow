import { Module } from '@nestjs/common';
import { UserRepository } from './typeorm/users.repository';
import { RoleRepository } from './typeorm/roles.repository';
import { USER_REPO, ROLE_REPO, PERMISSION_REPO, FRIENDSHIP_REPO } from '../core/ports/tokens';
import { PermissionRepository } from './typeorm/permission.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { FriendshipRepository } from './typeorm/friendship.repository';
import { Friendship } from '../friendship/entities/friendship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, Friendship])],
  providers: [
    { provide: USER_REPO, useClass: UserRepository },

    { provide: ROLE_REPO, useClass: RoleRepository },

    { provide: PERMISSION_REPO, useClass: PermissionRepository },

    { provide: FRIENDSHIP_REPO, useClass: FriendshipRepository },
  ],
  exports: [USER_REPO, ROLE_REPO, PERMISSION_REPO, FRIENDSHIP_REPO],
})
export class InfraModule {}
