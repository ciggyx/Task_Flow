import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface PriorityDetail {
  total: number;
  finished: number;
}
// Definimos las interfaces aquí para reutilizarlas
export interface PriorityBreakdown {
  high: PriorityDetail;
  medium: PriorityDetail;
  low: PriorityDetail;
  urgent:PriorityDetail;
}

export interface LeaderboardUser {
  id: number;
  userId: number;
  totalPoints: number;
  tasksCompleted: number;
  userName: string;
  userEmail: string;
}

export interface DashboardStatsData {
  createdInPeriod: number;
  finishedInPeriod: number;
  dueInPeriod: number;
  completedOnTime: number;
  overdue: number;
  priorityBreakdown: PriorityBreakdown;
  efficiency: string;
  leaderboard: LeaderboardUser[];
  dashboardName: string;
  dashboardLink: string;
  startDate: string; // Cambiamos month/year por start/end
  endDate: string;
}

@Injectable({
  providedIn: 'root' // Esto hace que esté disponible en toda la app automáticamente
})
export class DashboardStatsService {
  private apiUrl = 'http://localhost:3002/dashboard/statistics'; // Ajusta según tu environment

  constructor(private http: HttpClient) {}

  getStats(dashboardId: number, startDate: string, endDate: string): Observable<DashboardStatsData> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DashboardStatsData>(`${this.apiUrl}/${dashboardId}`, { params });
  }
}