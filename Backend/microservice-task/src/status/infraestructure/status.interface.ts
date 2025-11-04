import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { Status } from '../entities/status.entity';

export interface IStatusRepository {
  create(createStatusDto: CreateStatusDto): Promise<Status>;

  findAll(): Promise<Status[]>;

  findOne(id: number): Promise<Status | null>;

  findOneByName(name: string): Promise<Status | null>;

  update(id: number, updatedStatusDto: UpdateStatusDto): Promise<Status | null>;

  delete(id: number): Promise<void>;

  save(status: Status): Promise<Status>;
}
