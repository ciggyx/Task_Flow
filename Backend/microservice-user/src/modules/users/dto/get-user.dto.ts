import { IsString } from 'class-validator';

export class GetUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}
