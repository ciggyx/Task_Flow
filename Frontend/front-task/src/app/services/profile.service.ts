import { Injectable } from '@angular/core';
import { UserDTO, UserModel } from '../Models/User/user.model';
import { delay, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  private useMock = true;
  private userURL = 'http://localhost:3001';

  private mockProfile = {
    id: 1,
    email: 'johndoe@example.com',
    name: 'John Doe',
    bio: 'A short bio about John Doe.',
  };

  getUserData(userId: number): Observable<UserModel> {
    if (!this.useMock) {
      return this.http
        .get<UserDTO>(`${this.userURL}/users/${userId}`)
        .pipe(map((dto) => UserModel.fromDTO(dto)));
    }
    return this.mockProfile ? of(UserModel.fromDTO(this.mockProfile)) : of();
  }
}
