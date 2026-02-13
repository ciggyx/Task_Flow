import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  // Usando la base URL que proporcionaste
  private baseUrl = 'http://localhost:3002';
  private apiUrl = `${this.baseUrl}/friendship`; 

  constructor(private http: HttpClient) {}

  accept(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/accept`, {});
  }

  reject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}