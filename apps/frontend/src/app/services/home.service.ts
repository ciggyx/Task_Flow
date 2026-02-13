import { Injectable, signal } from '@angular/core';
import { DashboardDTO, DashboardModel } from '../Models/Dashboard/dashboard.model';
import { delay, map, Observable, of } from 'rxjs';
import { ContractsDTO, ContractModel } from '../Models/Contract/contract.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) { }

  private useMock = false;
  private baseUrl = 'http://localhost:3002';
  status = signal('');
  errorMessage = signal('');

  private mockContracts: ContractsDTO[] = [
    { id: 1, user: { id: 1 }, dashboard: { id: 300 }, role: { id: 1 } },
    { id: 2, user: { id: 1 }, dashboard: { id: 100 }, role: { id: 2 } },
    { id: 3, user: { id: 2 }, dashboard: { id: 100 }, role: { id: 1 } },
    { id: 4, user: { id: 1 }, dashboard: { id: 200 }, role: { id: 1 } },
    { id: 5, user: { id: 3 }, dashboard: { id: 100 }, role: { id: 2 } },
    { id: 6, user: { id: 4 }, dashboard: { id: 100 }, role: { id: 2 } },
    { id: 7, user: { id: 1 }, dashboard: { id: 900 }, role: { id: 1 } },
    { id: 8, user: { id: 1 }, dashboard: { id: 600 }, role: { id: 2 } },
    { id: 9, user: { id: 1 }, dashboard: { id: 500 }, role: { id: 2 } },
  ];

  mockDashboards = [
    { id: 200, name: 'Dashboard 1' },
    { id: 900, name: 'Dashboard 2' },
    { id: 300, name: 'Dashboard 3' },
    { id: 100, name: "Jame's Dashboard" },
    { id: 500, name: "Anna's Dashboard" },
    { id: 600, name: "Mark's Dashboard" },
  ];

  getSharedDashboardsByUser(): Observable<DashboardModel[] | null> {
    if (!this.useMock) {
      return this.http
        .get<DashboardDTO[]>(`${this.baseUrl}/dashboard/shared`)
        .pipe(map((dtos) => dtos.map((dto) => DashboardModel.fromDTO(dto))));
    }
    const mockId = 1;
    const contractModels = this.mockContracts
      .map((dto) => ContractModel.fromDTO(dto))
      .filter((t) => Number(t.userId) === Number(mockId));
    const contractModels2 = contractModels.filter((t) => Number(t.roleId) === Number(2));
    const dashboardIds = [...new Set(contractModels2.map((contract) => contract.dashboardId))];
    const filteredDashboardDTOs = this.mockDashboards.filter((dashboardDTO) =>
      dashboardIds.includes(dashboardDTO.id),
    );
    const models = filteredDashboardDTOs.map((dto) => DashboardModel.fromDTO(dto));
    return of(models);
  }

  getOwnedDashboardsByUser(): Observable<DashboardModel[] | null> {
    if (!this.useMock) {
      return this.http
        .get<DashboardDTO[]>(`${this.baseUrl}/dashboard/owned`)
        .pipe(map((dtos) => dtos.map((dto) => DashboardModel.fromDTO(dto))));
    }
    const mockId = 1;
    const contractModels = this.mockContracts
      .map((dto) => ContractModel.fromDTO(dto))
      .filter((t) => Number(t.userId) === Number(mockId));
    const contractModels2 = contractModels.filter((t) => Number(t.roleId) === Number(1));
    const dashboardIds = [...new Set(contractModels2.map((contract) => contract.dashboardId))];
    const filteredDashboardDTOs = this.mockDashboards.filter((dashboardDTO) =>
      dashboardIds.includes(dashboardDTO.id),
    );
    const models = filteredDashboardDTOs.map((dto) => DashboardModel.fromDTO(dto));
    return of(models);
  }

  updateDashboard(updatedDashboard: DashboardModel): Observable<DashboardModel> {
    if (!this.useMock) {
      return this.http
        .patch<DashboardDTO>(
          `${this.baseUrl}/dashboard/${updatedDashboard.id}`,
          updatedDashboard.toDTOWithoutID(),
        )
        .pipe(map((dto) => DashboardModel.fromDTO(dto)));
    }
    const index = this.mockDashboards.findIndex((d) => d.id === updatedDashboard.id);
    if (index !== -1) {
      this.mockDashboards[index] = updatedDashboard.toDTO();
    }
    return of(updatedDashboard);
  }

  newDashboard(
    newDashboardName: string,
    newDashboardDescription: string,
    newDashboardRequiresreview: boolean,
    newDashboardPreset: string,
  ): Observable<DashboardModel> {
    if (!this.useMock) {
      console.log('Posting dashboard with preset:', newDashboardPreset);
      return this.http
        .post<DashboardDTO>(`${this.baseUrl}/dashboard`, {
          name: newDashboardName,
          description: newDashboardDescription,
          requiresReview: newDashboardRequiresreview,
          preset: newDashboardPreset
        })
        .pipe(map((dto) => DashboardModel.fromDTO(dto)));
    }
    return of();
  }

  deleteDashoard(dashboard: DashboardModel) {
    return this.http.delete(`${this.baseUrl}/dashboard/${dashboard.id}`);
  }
}