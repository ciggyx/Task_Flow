import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  login(credentials: { identifierName: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.accessToken);
      }),
    );
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }
  restorePassword(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/restore-password`, { email, password });
  }
}
