import { CreatePriorityDto } from "@microservice-tasks/priority/dto/create-priority.dto";
import { UpdatePriorityDto } from "@microservice-tasks/priority/dto/update-priority.dto";
import { Priority } from "@microservice-tasks/priority/entities/priority.entity";

export interface IPriorityRepository {
  create(createPriorityDto: CreatePriorityDto): Promise<Priority>;

  save(priority: Priority): Promise<Priority>;

  findAll(): Promise<Priority[]>;

  findOne(id: number): Promise<Priority | null>;

  findOneByName(name: string): Promise<Priority | null>;

  update(id: number, updatePriorityDto: UpdatePriorityDto): Promise<Priority | null>;

  remove(id: number): Promise<void>;

  count(): Promise<number>;

  saveArray(priority: { name: string; description: string }[]): Promise<Priority[]>;
}
