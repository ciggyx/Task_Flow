import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePriorityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
