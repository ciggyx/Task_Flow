import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFriendshipDto } from './create-friendship.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FriendshipStatus } from '../entities/friendship.entity'; // Asegúrate de que la ruta sea correcta

export class UpdateFriendshipDto extends PartialType(CreateFriendshipDto) {
  
  @ApiProperty({
    description: 'El nuevo estado de la relación de amistad',
    enum: FriendshipStatus,
    example: FriendshipStatus.ACCEPTED,
  })
  @IsNotEmpty()
  @IsEnum(FriendshipStatus)
  status: FriendshipStatus;
}