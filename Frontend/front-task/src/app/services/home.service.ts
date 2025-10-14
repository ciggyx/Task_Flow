import { Injectable } from '@angular/core';
import { DashboardDTO, DashboardModel } from '../Models/Dashboard/dashboard.model';
import { delay, map, Observable, of } from 'rxjs';
import { ContractsDTO, ContractModel } from '../Models/Contract/contract.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(private http: HttpClient) {}

  private useMock = true;
  private baseUrl = 'http://localhost:3000';

  private mockContracts: ContractsDTO[] = [
      {id:1, user: {id: 1}, dashboard: {id: 300}, role: {id:1}},
      {id:2, user: {id: 1}, dashboard: {id: 100}, role: {id:2}},
      {id:3, user: {id: 2}, dashboard: {id: 100}, role: {id:1}},
      {id:4, user: {id: 1}, dashboard: {id: 200}, role: {id:1}},
      {id:5, user: {id: 3}, dashboard: {id: 100}, role: {id:2}},
      {id:6, user: {id: 4}, dashboard: {id: 100}, role: {id:2}},
      {id:7, user: {id: 1}, dashboard: {id: 900}, role: {id:1}},
      {id:8, user: {id: 1}, dashboard: {id: 600}, role: {id:2}},
      {id:9, user: {id: 1}, dashboard: {id: 500}, role: {id:2}},
    ];

  mockDashboards = [
    { id: 200, name: 'Dashboard 1', image: 'https://via.placeholder.com/150' },
    { id: 900, name: 'Dashboard 2', image: 'https://via.placeholder.com/150' },
    { id: 300, name: 'Dashboard 3', image: 'https://via.placeholder.com/150' },
    { id: 100, name: "Jame's Dashboard", image: 'https://via.placeholder.com/150' },
    { id: 500, name: "Anna's Dashboard", image: 'https://via.placeholder.com/150' },
    { id: 600, name: "Mark's Dashboard", image: 'https://via.placeholder.com/150' }
  
  ];

  getUserIDByToken(token: string): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/users/getIdByEmail`, { token });
  }

  getSharedDashboardsByUser(userId: number | null): Observable<DashboardModel[] | null> {
    if (userId == null) {
      return of(null);
    }
    if (!this.useMock ) {
      return this.http.get<DashboardDTO[]>(`${this.baseUrl}/users/${userId}/sharedDashboards`).pipe(
              map(dtos => dtos.map(dto => DashboardModel.fromDTO(dto)))
            );
    }
    const contractModels = this.mockContracts.map(dto => ContractModel.fromDTO(dto)).filter(t => Number(t.userId) === Number(userId));
    const contractModels2 = contractModels.filter(t => Number(t.roleId) === Number(2));
    const dashboardIds = [...new Set(contractModels2.map(contract => contract.dashboardId))];
    const filteredDashboardDTOs = this.mockDashboards.filter(dashboardDTO => dashboardIds.includes(dashboardDTO.id));
    const models = filteredDashboardDTOs.map(dto => DashboardModel.fromDTO(dto));
    return of(models);
  }

  getOwnedDashboardsByUser(userId: number | null): Observable<DashboardModel[] | null> {
    if (userId == null) {
      return of(null);
    }
    if (!this.useMock ) {
      return this.http.get<DashboardDTO[]>(`${this.baseUrl}/users/${userId}/ownedDashboards`).pipe(
              map(dtos => dtos.map(dto => DashboardModel.fromDTO(dto)))
            );
    }
    const contractModels = this.mockContracts.map(dto => ContractModel.fromDTO(dto)).filter(t => Number(t.userId) === Number(userId));
    const contractModels2 = contractModels.filter(t => Number(t.roleId) === Number(1));
    const dashboardIds = [...new Set(contractModels2.map(contract => contract.dashboardId))];
    const filteredDashboardDTOs = this.mockDashboards.filter(dashboardDTO => dashboardIds.includes(dashboardDTO.id));
    const models = filteredDashboardDTOs.map(dto => DashboardModel.fromDTO(dto));
    return of(models);
  }

}
