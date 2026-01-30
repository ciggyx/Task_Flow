import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error'; // Opcional: para íconos de colores
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Simulamos datos iniciales (esto vendría de tu API)
  private mockNotifications: AppNotification[] = [
    { id: 1, title: 'Nuevo usuario', message: 'Juan se unió al dashboard.', date: new Date(), read: false, type: 'info' },
    { id: 2, title: 'Tarea completada', message: 'El reporte mensual está listo.', date: new Date(Date.now() - 3600000), read: false, type: 'success' },
    { id: 3, title: 'Alerta de sistema', message: 'Mantenimiento programado para mañana.', date: new Date(Date.now() - 86400000), read: true, type: 'warning' }
  ];

  // Subject para manejar el estado de las notificaciones
  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.mockNotifications);
  
  // Observable público
  notifications$ = this.notificationsSubject.asObservable();

  constructor() { }

  // Método para obtener notificaciones (aquí harías tu HTTP GET)
  getNotifications() {
    return this.notificationsSubject.getValue();
  }

  // Obtener cantidad de no leídas para el badge rojo
  get unreadCount$(): Observable<number> {
    // Retornamos un observable derivado (podrías usar 'map' de rxjs también)
    // Para simplificar, calculamos al vuelo o creamos otro BehaviorSubject
    return new Observable(observer => {
      this.notifications$.subscribe(notifs => {
        observer.next(notifs.filter(n => !n.read).length);
      });
    });
  }

  // Marcar una como leída
  markAsRead(id: number) {
    const updated = this.notificationsSubject.getValue().map(n => {
      if (n.id === id) return { ...n, read: true };
      return n;
    });
    this.notificationsSubject.next(updated);
    
    // AQUÍ: Llamarías a tu backend (ej: http.put(`/api/notifications/${id}/read`))
  }

  // Marcar todas como leídas
  markAllAsRead() {
    const updated = this.notificationsSubject.getValue().map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    // AQUÍ: Llamada al backend
  }
}