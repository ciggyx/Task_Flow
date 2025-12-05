import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';
import { normalizeRemoteError } from './error/normalize-remote-error';

@Injectable()
export class AuthService {
  constructor(@Inject('USERS_SERVICE') private readonly usersClient: ClientProxy) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const response: { status: string } = await firstValueFrom(
        this.usersClient.send({ cmd: 'user_register' }, { createUserDto }),
      );

      return {
        success: true,
        data: response,
      };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);

      const status = payload.status ?? 500;
      const message = payload.message ?? 'Unexpected error during user registration';

      return {
        success: false,
        error: {
          statusCode: status,
          message,
          details: payload.details ?? null,
        },
      };
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const response: { accessToken: string; refreshToken: string } = await firstValueFrom(
        this.usersClient.send({ cmd: 'user_login' }, { loginUserDto }),
      );
      return {
        success: true,
        data: response,
      };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);

      return {
        success: false,
        error: {
          statusCode: payload.status,
          message: payload.message,
          details: payload.details,
        },
      };
    }
  }
}
