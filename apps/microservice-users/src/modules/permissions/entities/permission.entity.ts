import { Role } from '../../roles/entities/role.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Permission')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Role, (rol) => rol.permissions)
  roles: Role[];
}
