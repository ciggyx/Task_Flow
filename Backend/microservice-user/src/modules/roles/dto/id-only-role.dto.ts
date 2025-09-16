import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdOnlyRolDto {
  @IsString()
  code: string;
}
