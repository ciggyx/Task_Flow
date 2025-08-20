// src/roles/entities/role.entity.ts
import { Permission } from "src/permissions/entities/permission.entity";
import { UserEntity } from "src/users/entities/user.entity";
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("rol")
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  @JoinTable()
  permissions: Permission[];

  @OneToMany(() => UserEntity, (user) => user.rol)
  users: UserEntity[];
}
