import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FriendshipDTO, FriendshipModel } from '../Models/Friendship/friendship.model';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private baseUrl = 'http://localhost:3002';
  private apiUrl = `${this.baseUrl}/friendship`;

  constructor(private http: HttpClient) {}

  accept(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/accept`, {});
  }

  reject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getFriendList(): Observable<FriendshipModel[]> {
  return this.http
  .get<FriendshipDTO[]>(`${this.baseUrl}/friendship/my-list`)
  .pipe(map((dtos) => dtos.map((dto) => FriendshipModel.fromDTO(dto))));
  }

  sendFriendRequest(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { email });
  }

  removeFriend(friendshipId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${friendshipId}`);
  }

}