import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  relatedResourceId?: string;
}