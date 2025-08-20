import {
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Priority } from 'src/priority/entities/priority.entity';
import { Status } from 'src/status/entities/status.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsObject()
  @ValidateNested()
  @IsNotEmpty()
  priority: Priority;

  @IsObject()
  @IsNotEmpty()
  status: Status;
}
