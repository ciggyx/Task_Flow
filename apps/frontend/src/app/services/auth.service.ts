import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface JwtPayload {
  sub: number;
  email: string;

  rolesId: number[];
  rolesCode: string[];

  permissions: string[];

  iat: number;
  exp: number;

  [key: string]: any;
}


@Injectable({ providedIn: 'root' })

export class AuthService {
  private baseUrl = 'http://localhost:3002';
  private token: string | null = null;
  private userSubject = new BehaviorSubject<JwtPayload | null>(null);
  private isBrowser: boolean;
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.restore();
  }

 login(credentials: { identifierName: string; password: string }): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/login`, credentials).pipe(
    tap((response: any) => {
      this.setToken(response.data.accessToken);
    })
  );
}
  
  private restore() {
    if (!this.isBrowser) return;
    const token = localStorage.getItem('token');
    if (token) this.setToken(token);
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  logout(): void {
  this.clearToken();
}

  getToken(): string | null {
    if (this.token) return this.token;
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string) {
    this.token = token;
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
    const decoded = jwtDecode<JwtPayload>(token);
    this.userSubject.next(decoded);
  }

  private clearToken() {
    this.token = null;
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
    this.userSubject.next(null);
  }

 isAuthenticated(): boolean {
    const t = this.getToken();
    if (!t) return false;
    const decoded = (() => {
      try { return jwtDecode<JwtPayload>(t); } catch { return null; }
    })();
    return !!decoded && !(decoded.exp && decoded.exp * 1000 < Date.now());
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }
  restorePassword(email: string, password: string): Observable<any> {
    console.log('Restoring password: ', email, password);
    return this.http.post(`${this.baseUrl}/auth/restore-password`, { email, password });
  }
}
