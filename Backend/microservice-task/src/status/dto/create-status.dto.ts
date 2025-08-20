import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
