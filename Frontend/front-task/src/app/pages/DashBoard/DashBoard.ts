import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskModel } from '../../Models/Task/task.model';
import { UserModel } from '../../Models/User/user.model';
import { DashBoardService } from '../../services/dashboard.service';
import { combineLatest, finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { StatusModel } from '../../Models/Status/status.model';
import { U } from '@angular/cdk/keycodes';
import { TaskEditModalComponent } from '../modal-edit-task/task-edit-modal.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, TaskEditModalComponent],
  templateUrl: './DashBoard.html',
  styleUrls: ['./DashBoard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardId!: number;
  tasks: TaskModel[] = [];
  statuses: StatusModel[] = [];
  users: UserModel[] = [];
  tasksByStatus: { [status: number]: TaskModel[] } = {};
  private destroy$ = new Subject<void>();
  loading = false;
  selectedTask: TaskModel | null = null;
  isEditModalOpen = false;
  
  constructor(private route: ActivatedRoute, private dashBoardService: DashBoardService) {}
  
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((pm: ParamMap) => {
      this.dashboardId = Number(pm.get('id'));
      this.loadDashboardData();
    });
  }
  
  private loadTaskByStatus() {
    this.tasksByStatus = {}
    this.statuses.forEach(status => {
      this.tasksByStatus[status.id] = [];
      this.tasksByStatus[status.id] = this.filterTasksByStatus(status);
    });
    return this.tasksByStatus;
  }
  
  private filterTasksByStatus(status: StatusModel) {
    return this.tasks.filter(task => task.status?.id === status.id);
  }
  
  private loadDashboardData(): void {
    this.loading = true;
    combineLatest([
      this.dashBoardService.getStatuses(),
      this.dashBoardService.getTasks(this.dashboardId),
      this.dashBoardService.getUsers(this.dashboardId)
    ])
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.loading = false))
    )
    .subscribe({
      next: ([statuses, tasks, users]) => {
        this.statuses = statuses;
        this.tasks = tasks;
        this.users = users;
        this.tasksByStatus = this.loadTaskByStatus();
        console.log('Dashboard data loaded', { statuses, tasks, users });
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.tasks = [];
        this.statuses = [];
        this.tasksByStatus = {};
      }
    });
  }
  
  refreshData(): void {
    this.loadDashboardData();
  }
  
  trackByStatus(index: number, status: StatusModel): any {
    return status.id || status.name;
  }
  
  trackByTask(index: number, task: TaskModel): any {
    return task.id || task.name;
  }
  
  getTaskCountForStatus(statusId: number): number {
    return this.tasksByStatus[statusId] ? this.tasksByStatus[statusId].length : 0;
  }
  
  getPriorityClass(priorityId: number): string {
    const priorityClasses: { [key: number]: string } = {
      1: 'bg-low',
      2: 'bg-warning',
      3: 'bg-high',
      4: 'bg-danger'
    };
    return priorityClasses[priorityId] || 'bg-secondary';
  }
  
  getStatusClass(statusId: number): string {
    if (!statusId) return 'bg-secondary';
   
    const statusClasses: { [key: number]: string } = {
      1 : 'bg-todo',
      2 : 'bg-doing',
      3 : 'bg-in-review',
      4 : 'bg-done',
    };
    return statusClasses[statusId] || 'bg-secondary';
  }
  
  // Get connected drop lists for a status column
  getConnectedDropLists(currentStatusId: number): string[] {
    return this.statuses
      .filter(status => status.id !== currentStatusId)
      .map(status => `drop-list-${status.id}`);
  }
  
  // Handle drag and drop event
  drop(event: CdkDragDrop<TaskModel[]>, targetStatusId: number): void {
    if (event.previousContainer === event.container) {
      // Moving within the same container
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between containers
      const movedTask = event.previousContainer.data[event.previousIndex];
      
      // Transfer the item between arrays
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the task's status
      const targetStatus = this.statuses.find(s => s.id === targetStatusId);
      if (targetStatus && movedTask) {
        movedTask.status = targetStatus;
        
        const taskIndex = this.tasks.findIndex(t => t.id === movedTask.id);
        if (taskIndex !== -1) {
          this.tasks[taskIndex].status = targetStatus;
        }
        
        this.updateTaskStatus(movedTask, targetStatus);
        
        console.log(`Task "${movedTask.name}" moved to status "${targetStatus.name}"`);
      }
    }
  }
  
  private updateTaskStatus(task: TaskModel, newStatus: StatusModel): void {
    this.dashBoardService.updateTaskStatus(task.id, newStatus.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {console.log('Task status updated successfully')
        },
        error: (err) => {
          console.error('Failed to update task status', err);
          this.loadDashboardData();
        }
      })
  }

  getUserName(userId?: number | null): string {
  if (!userId) return 'Unassigned';
  const user = this.users.find(u => u.id === userId);
  if (!user) return 'Unassigned';
  return user.name || `Unknown`;
}

getUserEmail(userId?: number | null): string {
  if (!userId) return '';
  const user = this.users.find(u => u.id === userId);
  return user?.email || 'Unknown';
}
  
  assignTask(task: TaskModel) {
    console.log('assigned', task);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  editTask(task: TaskModel) {
  this.selectedTask = task;
  this.isEditModalOpen = true;
  }

  onModalSave(updatedTask: TaskModel) {
    this.isEditModalOpen = false;
    if (!updatedTask) return;
    this.dashBoardService.updateTask(updatedTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Task updated successfully');
          console.log({ updatedTask });
          this.refreshData();
          console.log(this.tasks);
        },
        error: (err) => {
          console.error('Failed to update task', err);
        }
      });
  }

  onModalCancel() {
    this.isEditModalOpen = false;
    this.selectedTask = null;
  }



}