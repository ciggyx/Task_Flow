import { ApiProperty } from "@nestjs/swagger/dist/decorators";
import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";
export class CreateNotificationDto {
  @ApiProperty()
  @IsInt()
  @IsOptional()
  userId?: number;

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
  relatedResourceId?: number;
}