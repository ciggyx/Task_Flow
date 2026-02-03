import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  createdAt: Date; // Ajustado a lo que suele devolver TypeORM
  read: boolean;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = 'http://localhost:3002';
  
  // Iniciamos con un array vacío
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargamos las notificaciones al iniciar el servicio
    this.loadNotifications();
  }

  // GET: Obtener notificaciones del backend
  loadNotifications(): void {
    this.http.get<AppNotification[]>(`${this.baseUrl}/notification/my-notifications`)
      .subscribe({
        next: (notifs) => this.notificationsSubject.next(notifs),
        error: (err) => console.error('Error cargando notificaciones', err)
      });
  }

  get unreadCount$(): Observable<number> {
    return this.notifications$.pipe(
      map(notifs => notifs.filter(n => !n.read).length)
    );
  }

  // PATCH: Marcar como leída en el servidor y actualizar estado local
  markAsRead(id: number): void {
    this.http.patch(`${this.baseUrl}/${id}/notification/read`, {})
      .pipe(
        tap(() => {
          // Actualizamos el estado local sin necesidad de recargar todo del server
          const currentNotifs = this.notificationsSubject.getValue();
          const updated = currentNotifs.map(n => n.id === id ? { ...n, read: true } : n);
          this.notificationsSubject.next(updated);
        })
      ).subscribe();
  }

  // Si decides implementar el "marcar todas" en el backend:
  markAllAsRead(): void {
    // Ejemplo de cómo podrías manejarlo si creas el endpoint en NestJS
    this.http.patch(`${this.baseUrl}/notification/read-all`, {}).subscribe(() => {
        const updated = this.notificationsSubject.getValue().map(n => ({ ...n, read: true }));
        this.notificationsSubject.next(updated);
    });
  }
}