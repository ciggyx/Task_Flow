import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendshipDto } from '@shared/dtos';

export class UpdateFriendshipDto extends PartialType(CreateFriendshipDto) {}
