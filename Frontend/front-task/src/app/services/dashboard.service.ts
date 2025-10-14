import { Injectable } from '@angular/core';
import { PriorityDTO, PriorityModel } from '../Models/Priority/priority.model';
import { StatusDTO, StatusModel } from '../Models/Status/status.model';
import { TaskDTO, TaskModel } from '../Models/Task/task.model';
import { UserDTO,UserModel } from '../Models/User/user.model';
import { map, Observable, of } from 'rxjs';
import { ContractsDTO, ContractModel } from '../Models/Contract/contract.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashBoardService {
  constructor(private http: HttpClient) {}
  private baseUrl = 'http://localhost:3000';
  private useMock = true;

  private mockContracts: ContractsDTO[] = [
    {id:1, user: {id: 1}, dashboard: {id: 100}, role: {id:1}},
    {id:2, user: {id: 2}, dashboard: {id: 100}, role: {id:1}},
    {id:3, user: {id: 3}, dashboard: {id: 100}, role: {id:1}},
    {id:4, user: {id: 1}, dashboard: {id: 200}, role: {id:1}},
    {id:5, user: {id: 2}, dashboard: {id: 100}, role: {id:1}},
    {id:6, user: {id: 4}, dashboard: {id: 100}, role: {id:1}}
  ];

  private mockUsers: UserDTO[] = [
    {id: 1, name: 'Julian', email: 'julian@example'},
    {id: 2, name: 'Alex', email: 'alex@example'},
    {id: 3, name: 'Dozer', email: 'dozer@example'},
    {id: 4, name: 'Lichi', email: 'lichi@example'}
  ];

  private mockPriorities: PriorityDTO[] = [
    {id: 1, name: 'Low'},
    {id: 2, name: 'Medium'},
    {id: 3, name: 'High'},
    {id: 4, name: 'Urgent'}
  ];

  private mockStatuses: StatusDTO[] = [
    {id: 1, name: 'To Do'},
    {id: 2, name: 'Doing'},
    {id: 3, name: 'In Review'},
    {id: 4, name: 'Done'}
  ];

  private mockTasks: TaskDTO[] = [
    {
      id: 1,
      dashboard: {id: 100},
      name: 'Design header',
      startDate: new Date('2025-08-01T09:00:00Z'),
      endDate: new Date('2025-08-05T17:00:00Z'),
      finishDate: null,
      status: { id: 1 },
      priority: { id: 3 },
      description: 'Create responsive header',
      user: {id: 1}
    },
    {
      id: 2,
      dashboard: {id: 100},
      name: 'Implement auth',
      startDate: new Date('2025-08-02T10:00:00Z'),
      endDate: new Date('2025-08-07T18:00:00Z'),
      finishDate: null,
      status: { id: 2 },
      priority: { id: 4 },
      description: 'Login, register endpoints + UI',
      user: { id: 2 }
    },
    {
      id: 3,
      dashboard: {id: 100},
      name: 'Write unit tests for service with a very long name to check ellipsis',
      startDate: null,
      endDate: null,
      finishDate: null,
      status: { id: 3 },
      priority: { id: 1 },
      description: 'Add coverage for critical paths',
      user: { id: 3 }
    },
    {
      id: 17,
      dashboard: {id: 100},
      name: 'wow',
      startDate: null,
      endDate: null,
      finishDate: null,
      status: { id: 4 },
      priority: { id: 3 },
      description: 'Add coverage for critical paths',
      user: { id: 4 }
    },
    {
      id: 4,
      dashboard: {id: 100},
      name: 'Onboard customer',
      startDate: new Date('2025-07-20T09:00:00Z'),
      endDate: new Date('2025-07-25T17:00:00Z'),
      finishDate: new Date('2025-07-24T15:00:00Z'),
      status: { id: 1 },
      priority: { id: 2 },
      description: 'Onboarding tasks done',
      user: { id: 1 }
    },
    {
      id: 5,
      dashboard: {id: 200},
      name: 'wow',
      startDate: new Date('2025-07-20T09:00:00Z'),
      endDate: new Date('2025-07-25T17:00:00Z'),
      finishDate: new Date('2025-07-24T15:00:00Z'),
      status: { id: 2 },
      priority: { id: 3 },
      description: 'wow',
      user: { id: 1 }
    }
  ];

  getTasks(dashboardId: number): Observable<TaskModel[]> {
    if (!this.useMock) {
      return this.http.get<TaskDTO[]>(`${this.baseUrl}/dashboards/${dashboardId}/tasks`).pipe(
        map(dtos => dtos.map(dto => TaskModel.fromDTO(dto)))
      );
    }
      const dtos = this.mockTasks.filter(t => Number(t.dashboard.id) === Number(dashboardId));
      const models = dtos.map(dto => TaskModel.fromDTO(dto));
      return of(models);
  }

  getStatuses(): Observable<StatusModel[]> {
    if (!this.useMock) {
      return this.http.get<StatusDTO[]>(`${this.baseUrl}/statuses`).pipe(
      map(dtos => dtos.map(dto => StatusModel.fromDTO(dto)))
      );
    }
    const models = this.mockStatuses.map(dto => StatusModel.fromDTO(dto));
      return of(models);
  }

  getUsers(dashboardId: number): Observable<UserModel[]> {
    if (!this.useMock) {
      return this.http.get<UserDTO[]>(`${this.baseUrl}/dashboards/${dashboardId}/users`).pipe(
        map(dtos => dtos.map(dto => UserModel.fromDTO(dto)))
      );
    }
    const contractModels = this.mockContracts.map(dto => ContractModel.fromDTO(dto)).filter(t => Number(t.dashboardId) === Number(dashboardId)); 
    const userIds = [...new Set(contractModels.map(contract => contract.userId))];
    const filteredUserDTOs = this.mockUsers.filter(userDTO => userIds.includes(userDTO.id));
    const models = filteredUserDTOs.map(dto => UserModel.fromDTO(dto));
    return of(models);
  }

  getPriorities(): Observable<PriorityModel[]> {
    if (!this.useMock) {
      return this.http.get<PriorityDTO[]>(`${this.baseUrl}/priorities`).pipe(
        map(dtos => dtos.map(dto => PriorityModel.fromDTO(dto)))
      );
    }
    const models = this.mockPriorities.map(dto => PriorityModel.fromDTO(dto));
    return of(models);
  }

  updateTaskStatus(taskId: number, statusId: number): Observable<void> {
    if (!this.useMock) {
      return this.http.patch<void>(`${this.baseUrl}/tasks/${taskId}`, { statusId });
    }
    const task = this.mockTasks.find(t => t.id === taskId);
      if (task) {
        task.status = { id: statusId };
        console.log(this.mockTasks);
      }
    return of(undefined);
  }

  updateTask(task: TaskModel): Observable<void> {
    if (!this.useMock) {
      return this.http.put<void>(`${this.baseUrl}/tasks/${task.id}`, task.toDTO());
    }
    const index = this.mockTasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.mockTasks[index] = task.toDTO();
        console.log(task.toDTO());
      }
    return of(undefined);
  }

}
