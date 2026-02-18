import { PartialType, PickType } from "@nestjs/swagger";
import { CreateUserDto } from "@shared/dtos";

export class UpdateProfileDto extends PartialType(
  PickType(CreateUserDto, ['name', 'email', 'description'] as const),
) {}