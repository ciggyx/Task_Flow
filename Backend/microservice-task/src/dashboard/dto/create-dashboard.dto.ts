import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { Task } from 'src/task/entities/task.entity';

export class CreateDashboardDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  descripcion?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTaskDto)
  task: CreateTaskDto;
}
