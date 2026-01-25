import { IsEmail, IsNotEmpty } from "class-validator";

export class PasswordRestoreDto{

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}