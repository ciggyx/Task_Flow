import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';
import { normalizeRemoteError } from './error/normalize-remote-error';
import { PasswordResetDto } from './dto/password-reset.dto';
import { PasswordRestoreDto } from './dto/password-restore.dto';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy, // inyectamos MailService
  ) {}

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
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const response: { accessToken: string; refreshToken: string } = await firstValueFrom(
        this.usersClient.send({ cmd: 'user_login' }, { loginUserDto }),
      );
      return { success: true, data: response };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }

  async updateProfile(id: number, payload: UpdateProfileDto) {
      try {
        const user = await firstValueFrom(
          this.usersClient.send(
            { cmd: 'update_profile' }, // Corregí 'update-profile' a 'update_profile' para coincidir con tu MessagePattern
            { id, ...payload } 
          )
        );

        if (!user) {
          throw new HttpException({ message: 'User not found' }, 404);
        }
        
        return user; // Retorna el usuario actualizado al Frontend
      } catch (err) {
        const payload = normalizeRemoteError(err);
        throw new HttpException({ error: payload }, payload.status ?? 500);
      }
    }

  async getFullUserById(id:number){
    try {
      const user = await firstValueFrom(
        this.usersClient.send({ cmd : 'get_full_user_by_id'}, { id})
      );
      if (!user) {
        throw new HttpException(
          { message: 'User not found' },
          404,
        );
      }
      return  user;
    }catch (err) {
      const payload = normalizeRemoteError(err);
      throw new HttpException({ error: payload }, payload.status ?? 500);
    }
  }

  // --------------------
  // Forgot password
  // --------------------
  async forgotPassword(email: string): Promise<PasswordResetDto> {
    try {
      const response: { to: string; username: string; resetLink: string } = await firstValueFrom(
        this.usersClient.send({ cmd: 'forgot_password' }, { email }),
      );
      return response;
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }

  async sendPasswordResetMail(mailData: PasswordResetDto) {
    try {
      const response: { status: string } = await firstValueFrom(
        this.mailClient.send({ cmd: 'mail-password-reset' }, mailData),
      );
      return { success: true, data: response };
    } catch (err: unknown) {
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  }
  async restorePassword(passwordRestoreDto: PasswordRestoreDto){
    try {
      const response: { status: string } = await firstValueFrom(
        this.usersClient.send({ cmd: 'restore_password'}, passwordRestoreDto),
      );
      return { success: true, data : response};
    } catch (err : unknown){
      const payload = normalizeRemoteError(err);
      throw new HttpException(
        { success: false, error: payload },
        payload.status ?? 500,
      );
    }
  } 

  async getUserByEmail(email: string) : Promise<number> {
    try {
      const userId : number = await lastValueFrom(
        this.usersClient.send({ cmd: 'get_user_by_email' }, { email })
      );
      if (!userId) {
        throw new HttpException(
          { message: 'User not found' },
          404,
        );
      }

      return userId;
    } catch (err) {
      const payload = normalizeRemoteError(err);
      throw new HttpException({ error: payload }, payload.status ?? 500);
    }
  }
  async getUserById(id:number){
    try {
      const user = await firstValueFrom(
        this.usersClient.send({ cmd : 'get_user_by_id'}, { id})
      );
      if (!user) {
        throw new HttpException(
          { message: 'User not found' },
          404,
        );
      }
      return  user;
    }catch (err) {
      const payload = normalizeRemoteError(err);
      throw new HttpException({ error: payload }, payload.status ?? 500);
    }
  }
  async getUsersById(ids:number[]){
    try {
      console.log(ids)
      return await firstValueFrom(
        this.usersClient.send({ cmd : 'get_users_by_id'},
          ids 
        )
      )
    }
    catch (err){
      const payload = normalizeRemoteError(err);
      throw new HttpException({ error: payload}, payload.status ?? 500);
    }
  }
  async getAllUsers(){
    try {
      return await firstValueFrom(
        this.usersClient.send({ cmd : 'get_all_users'},{}
        )
      )
    }
    catch (err){
      const payload = normalizeRemoteError(err);
      throw new HttpException({ error: payload}, payload.status ?? 500);
    }
  }
}
