import { CreateUserDto } from '../../users/dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { IUserRepository } from '@microservice-users/modules/core/ports/users.port';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findUsersById(usersId: number[]): Promise<User[]> {
    return this.userRepository.find({
      where: { id: In(usersId) },
    });
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  save(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user);
  }

  saveArray(user: User[]): Promise<User[]> {
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findByEmail(email: string, relations?: string[]): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email },
      relations: relations,
    });
  }

  findByName(name: string, relations?: string[]): Promise<User | null> {
    return this.userRepository.findOne({
      where: { name: name },
      relations: relations,
    });
  }

  findOneBy(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id: id });
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
    return;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.save({
      id,
      ...updateUserDto,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
