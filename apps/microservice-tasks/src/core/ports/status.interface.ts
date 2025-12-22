import { CreateStatusDto } from "@microservice-tasks/status/dto/create-status.dto";
import { UpdateStatusDto } from "@microservice-tasks/status/dto/update-status.dto";
import { Status } from "@microservice-tasks/status/entities/status.entity";

export interface IStatusRepository {
  create(createStatusDto: CreateStatusDto): Promise<Status>;

  findAll(): Promise<Status[]>;

  findOne(id: number): Promise<Status | null>;

  findOneByName(name: string): Promise<Status | null>;

  update(id: number, updatedStatusDto: UpdateStatusDto): Promise<Status | null>;

  delete(id: number): Promise<void>;

  save(status: Status): Promise<Status>;

  saveArray(status: { name: string; description: string }[]): Promise<Status[]>;

  count(): Promise<number>;
}
