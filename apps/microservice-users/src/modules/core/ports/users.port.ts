import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { User } from 'src/modules/users/entities/user.entity';

export interface IUserRepository {
  create(createUserDto: CreateUserDto): Promise<User>;

  save(user: User): Promise<User>;

  saveArray(user: UpdateUserDto[]): Promise<User[]>;

  findAll(): Promise<User[]>;

  findByEmail(email: string, relations?: string[]): Promise<User | null>;

  findByName(name: string, relations?: string[]): Promise<User | null>;

  findOneBy(id: number): Promise<User | null>;

  findUsersById(usersId: number[]): Promise<User[]>;

  delete(id: number): Promise<void>;

  update(id: number, updateUserDto: UpdateUserDto): Promise<User | null>;
}
