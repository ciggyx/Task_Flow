import { Injectable } from '@angular/core';
import { PriorityDTO, PriorityModel } from '../Models/Priority/priority.model';
import { StatusDTO, StatusModel } from '../Models/Status/status.model';
import { TaskDTO, TaskModel } from '../Models/Task/task.model';
import { UserDTO, UserModel } from '../Models/User/user.model';
import { map, Observable, of } from 'rxjs';
import { ContractsDTO, ContractModel } from '../Models/Contract/contract.model';
import { HttpClient } from '@angular/common/http';
import { participantTypeDTO, participantTypeModel } from '../Models/ParticipantType/participantType.model';

@Injectable({
  providedIn: 'root',
})
export class DashBoardService {
  constructor(private http: HttpClient) {}
  private baseUrl = 'http://localhost:3002';
  private useMock = false;

  private mockContracts: ContractsDTO[] = [
    { id: 1, user: { id: 1 }, dashboard: { id: 100 }, role: { id: 1 } },
    { id: 2, user: { id: 2 }, dashboard: { id: 100 }, role: { id: 1 } },
    { id: 3, user: { id: 3 }, dashboard: { id: 100 }, role: { id: 1 } },
    { id: 4, user: { id: 1 }, dashboard: { id: 200 }, role: { id: 1 } },
    { id: 5, user: { id: 2 }, dashboard: { id: 100 }, role: { id: 1 } },
    { id: 6, user: { id: 4 }, dashboard: { id: 100 }, role: { id: 1 } },
  ];

  private mockUsers: UserDTO[] = [
    { id: 1, name: 'Julian', email: 'julian@example', description: '' },
    { id: 2, name: 'Alex', email: 'alex@example', description: '' },
    { id: 3, name: 'Dozer', email: 'dozer@example', description: '' },
    { id: 4, name: 'Lichi', email: 'lichi@example', description: '' },
  ];

  private mockPriorities: PriorityDTO[] = [
    { id: 1, name: 'Low' },
    { id: 2, name: 'Medium' },
    { id: 3, name: 'High' },
    { id: 4, name: 'Urgent' },
    { id: 5, name: 'Archived' },
  ];

  private mockStatuses: StatusDTO[] = [
    { id: 1, name: 'To Do' },
    { id: 2, name: 'Doing' },
    { id: 3, name: 'In Review' },
    { id: 4, name: 'Done' },
    { id: 5, name: 'Archived' },
  ];

  private mockTasks: TaskDTO[] = [
  {
    id: 1,
    name: "Initialize Project Repository",
    description: "Setup the Git repository, CI/CD pipelines, and initial folder structure.",
    startDate: "2026-01-01T09:00:00.000Z",
    endDate: "2026-01-05T17:00:00.000Z",
    finishDate: "2026-01-04T15:30:00.000Z",
    statusId: 3, // Assuming 3 = Completed
    priorityId: 3, // Assuming 3 = High
    dashboardId: 1,
    assignedToUserId: 2,
    reviewedByUserId: 1
  },
  {
    id: 2,
    name: "Bypassing Firewall",
    description: "Amplexus alter veritas accusantium vacuus crepusculum volva delicate vester ultio.",
    startDate: "2026-01-10T08:00:00.000Z",
    endDate: "2026-01-20T18:00:00.000Z",
    finishDate: null,
    statusId: 2, // Assuming 2 = In Progress
    priorityId: 2, // Assuming 2 = Medium
    dashboardId: 1,
    assignedToUserId: 5,
    reviewedByUserId: null
  },
  {
    id: 3,
    name: "Database Optimization",
    description: "Refactor slow-running queries and add necessary indexes to the Task table.",
    startDate: "2026-01-25T10:00:00.000Z",
    endDate: "2026-01-28T12:00:00.000Z",
    finishDate: null,
    statusId: 2,
    priorityId: 3,
    dashboardId: 1,
    assignedToUserId: 5,
    reviewedByUserId: 5
  },
  {
    id: 4,
    name: "Write Unit Tests",
    description: "Increase code coverage for the auth module.",
    startDate: "2026-02-01T09:00:00.000Z",
    endDate: null,
    finishDate: null,
    statusId: 1, // Assuming 1 = Backlog / Todo
    priorityId: 1, // Assuming 1 = Low
    dashboardId: 1,
    assignedToUserId: null,
    reviewedByUserId: null
  },
  {
    id: 5,
    name: "UI/UX Review",
    description: "Review final mockups with the design team before implementation.",
    startDate: null,
    endDate: "2026-01-30T16:00:00.000Z",
    finishDate: null,
    statusId: 1,
    priorityId: 2,
    dashboardId: 2,
    assignedToUserId: 3,
    reviewedByUserId: null
  }
];

  getDashboardDetails(dashboardId: number): Observable<any> {
    return this.http
    .get<any>(`${this.baseUrl}/dashboard/${dashboardId}`);
  }

  getTasks(dashboardId: number): Observable<TaskModel[]> {
    if (!this.useMock) {
      return this.http
        .get<TaskDTO[]>(`${this.baseUrl}/dashboard/${dashboardId}/tasks`)
        .pipe(map((dtos) => dtos.map((dto) => TaskModel.fromDTO(dto))));
    }
    const dtos = this.mockTasks.filter((t) => Number(t.dashboardId) === Number(dashboardId));
    const models = dtos.map((dto) => TaskModel.fromDTO(dto));
    return of(models);
  }

  getStatuses(): Observable<StatusModel[]> {
    if (!this.useMock) {
      return this.http
        .get<StatusDTO[]>(`${this.baseUrl}/statuses`)
        .pipe(map((dtos) => dtos.map((dto) => StatusModel.fromDTO(dto))));
    }
    const models = this.mockStatuses.map((dto) => StatusModel.fromDTO(dto));
    return of(models);
  }

  getUsers(dashboardId: number): Observable<UserModel[]> {
    if (!this.useMock) {
      return this.http
        .get<UserDTO[]>(`${this.baseUrl}/dashboard/${dashboardId}/users`)
        .pipe(map((dtos) => dtos.map((dto) => UserModel.fromDTO(dto))));
    }
    const contractModels = this.mockContracts
      .map((dto) => ContractModel.fromDTO(dto))
      .filter((t) => Number(t.dashboardId) === Number(dashboardId));
    const userIds = [...new Set(contractModels.map((contract) => contract.userId))];
    const filteredUserDTOs = this.mockUsers.filter((userDTO) => userIds.includes(userDTO.id));
    const models = filteredUserDTOs.map((dto) => UserModel.fromDTO(dto));
    return of(models);
  }

  getPriorities(): Observable<PriorityModel[]> {
    if (!this.useMock) {
      return this.http
        .get<PriorityDTO[]>(`${this.baseUrl}/priorities`)
        .pipe(map((dtos) => dtos.map((dto) => PriorityModel.fromDTO(dto))));
    }
    const models = this.mockPriorities.map((dto) => PriorityModel.fromDTO(dto));
    return of(models);
  }

  getParticipantTypes(): Observable<participantTypeModel[]> {
    if (!this.useMock) {
      return this.http
        .get<participantTypeDTO[]>(`${this.baseUrl}/participant-type`)
        .pipe(map((dtos) => dtos.map((dto) => participantTypeModel.fromDTO(dto))));
    }
    return of();
  }

  updateTaskStatus(taskId: number, statusId: number): Observable<void> {
    if (!this.useMock) {
      return this.http.patch<void>(`${this.baseUrl}/task/${taskId}`, { statusId });
    }
    const task = this.mockTasks.find((t) => t.id === taskId);
    if (task) {
      task.statusId = statusId;
    }
    return of(undefined);
  }

  updateTask(task: TaskModel): Observable<void> {
    if (!this.useMock) {
      return this.http.patch<void>(`${this.baseUrl}/task/${task.id}`, task.toUpdateDTO());
    }
    const index = this.mockTasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      this.mockTasks[index] = task.toDTO();
    }
    return of(undefined);
  }

  createTask(task: TaskModel): Observable<void> {
    if (!this.useMock) {
      return this.http.post<void>(`${this.baseUrl}/task`, task.toCreateDTO());
    }
    return of(undefined);
  }

  inviteUser(email: string, dashboardId: number): Observable<void>{
    const dto = {
      to : email,
      dashboardId: dashboardId,
    }
    return this.http.post<void>(`${this.baseUrl}/dashboard/dashboard-invite`, dto);
  }

  acceptInvitation(id : string): Observable<any>{
    return this.http.post(`${this.baseUrl}/dashboard/accept-invite/${id}`, {});
  }

  removeUserFromDashboard(id : number, dashboardId: number): Observable<any>{ 
    return this.http.delete(`${this.baseUrl}/dashboard/${dashboardId}/delete-user/${id}`, {});
  }

  changeUserRoleFromDashboard(id : number, dashboardId: number, rolId : number): Observable<any>{ 
    const dto = {
      roleId: rolId,
    }
    return this.http.patch(`${this.baseUrl}/dashboard/${dashboardId}/change-role/${id}`, dto);
  }
}
