import { CreatePriorityDto } from '../dto/create-priority.dto';
import { Priority } from '../entities/priority.entity';
import { UpdatePriorityDto } from '../dto/update-priority.dto';

export interface IPriorityRepository {
  create(createPriorityDto: CreatePriorityDto): Promise<Priority>;

  save(priority: Priority): Promise<Priority>;

  findAll(): Promise<Priority[]>;

  findOne(id: number): Promise<Priority | null>;

  findOneByName(name: string): Promise<Priority | null>;

  update(
    id: number,
    updatePriorityDto: UpdatePriorityDto,
  ): Promise<Priority | null>;

  remove(id: number): Promise<void>;
}
