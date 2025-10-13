import { Role } from 'src/modules/roles/entities/role.entity';
import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Index({ unique: true })
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  description: string;

  @ManyToMany(() => Role, (role) => role.users)
  roles: Role[];
}
