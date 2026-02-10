import { IsNotEmpty, IsNumber } from "class-validator";


export class ChangeRoleDto {
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}