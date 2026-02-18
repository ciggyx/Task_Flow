import { Injectable } from '@angular/core';
import { UserDTO, UserModel } from '../Models/User/user.model';
import { delay, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  private useMock = false;
  private userURL = 'http://localhost:3002';

  private mockProfile = {
    id: 1,
    email: 'johndoe@example.com',
    name: 'John Doe',
    bio: 'A short bio about John Doe.',
  };

  updateProfile(userId: number, data: { name: string; description: string }): Observable<UserModel> {
    if (!this.useMock) {
      return this.http.patch<UserDTO>(`${this.userURL}/auth/update-profile/${userId}`, data)
        .pipe(map((dto) => UserModel.fromDTO(dto)));
    }
    return of(UserModel.fromDTO({...this.mockProfile, ...data}));
  }

  getUserData(userId: number): Observable<UserModel> {
    if (!this.useMock) {
      return this.http
        .get<UserDTO>(`${this.userURL}/auth/user-by-id/${userId}`)
        .pipe(map((dto) => UserModel.fromDTO(dto)));
    }
    return this.mockProfile ? of(UserModel.fromDTO(this.mockProfile)) : of();
  }
}
