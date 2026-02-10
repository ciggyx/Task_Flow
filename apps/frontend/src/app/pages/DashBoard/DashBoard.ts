import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskModel } from '../../Models/Task/task.model';
import { UserModel } from '../../Models/User/user.model';
import { DashBoardService } from '../../services/dashboard.service';
import { combineLatest, finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { StatusModel } from '../../Models/Status/status.model';
import { SidebarService } from '../../services/sidebar.service';
import { TaskEditModalComponent } from '../modal-edit-task/task-edit-modal.component';
import { TaskCreateModalComponent } from '../modal-create-task/task-create-modal.component';
import { PriorityModel } from '../../Models/Priority/priority.model';
import { HeaderComponent } from '../../header/header.component';
import { ArchivedTasksModalComponent } from './Archived-task-modal/archived-tasks-modal';
import { ChangeDetectorRef } from '@angular/core';
import { MemberSidebarService } from '../../services/member-sidebar.service';
import { MemberSidebarComponent } from './Member-sidebar/member-sidebar';
import { participantTypeModel } from '../../Models/ParticipantType/participantType.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    TaskEditModalComponent,
    TaskCreateModalComponent,
    HeaderComponent,
    ArchivedTasksModalComponent,
    MemberSidebarComponent,
  ],
  templateUrl: './DashBoard.html',
  styleUrls: ['./DashBoard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardId!: number;
  tasks: TaskModel[] = [];
  statuses: StatusModel[] = [];
  users: UserModel[] = [];
  priorities: PriorityModel[] = [];
  participantTypes: participantTypeModel[] = [];
  tasksByStatus: { [status: number]: TaskModel[] } = {};
  private destroy$ = new Subject<void>();
  loading = false;
  selectedTask: TaskModel | null = null;
  isEditModalOpen = false;
  isSideBarOpen = false;
  readonly ARCHIVED_STATUS_ID = 5;
  readonly REVIEWED_STATUS_ID = 3;
  requiresReview = false
  archivedTasks: TaskModel[] = [];
  showArchived = false;
  archiveDropHover = false;
  isCreateModalOpen = false;
  newTaskStatusId = 1;
  isMemberSidebarOpen = false;

  constructor(
    private sidebarService: SidebarService,
    private route: ActivatedRoute,
    private dashBoardService: DashBoardService,
    private cdr: ChangeDetectorRef,
    private memberSidebarService: MemberSidebarService,
  ) {}

  ngOnInit(): void {
    this.memberSidebarService.isOpen$
    .pipe(takeUntil(this.destroy$))
    .subscribe((state) => {
      this.isMemberSidebarOpen = state;
      this.cdr.markForCheck();
    });
    this.sidebarService.isOpen$.subscribe((state) => (this.isSideBarOpen = state));
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((pm: ParamMap) => {
      this.dashboardId = Number(pm.get('id'));
      this.loadDashboardData();
    });
  }

  private loadTaskByStatus() {
    this.tasksByStatus = {};
    this.statuses.forEach((status) => {
      if (status.id === this.ARCHIVED_STATUS_ID) return;
      this.tasksByStatus[status.id] = [];
      this.tasksByStatus[status.id] = this.filterTasksByStatus(status);
    });
    console.log(this.tasksByStatus);
    return this.tasksByStatus;
  }

  private filterTasksByStatus(status: StatusModel) {
    return this.tasks.filter((task) => task.statusId === status.id);
  }

 private loadDashboardData(): void {
  this.loading = true;
  combineLatest([
    this.dashBoardService.getStatuses(),
    this.dashBoardService.getTasks(this.dashboardId),
    this.dashBoardService.getUsers(this.dashboardId),
    this.dashBoardService.getPriorities(),
    this.dashBoardService.getRevisionStatus(this.dashboardId),
    this.dashBoardService.getParticipantTypes(),
  ])
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    )
    .subscribe({
      next: ([statuses, tasks, users, priorities, requiresRev, participantTypes]) => {
        this.statuses = statuses;
        this.users = users;
        this.priorities = priorities;
        this.archivedTasks = tasks.filter((t) => t.statusId === this.ARCHIVED_STATUS_ID);
        this.tasks = tasks.filter((t) => t.statusId !== this.ARCHIVED_STATUS_ID);
        this.requiresReview = requiresRev
        this.participantTypes = participantTypes;

        this.tasksByStatus = this.loadTaskByStatus();
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.tasks = [];
        this.statuses = [];
        this.tasksByStatus = {};
        this.archivedTasks = [];
      },
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
      4: 'bg-low',
      3: 'bg-warning',
      2: 'bg-high',
      1: 'bg-urgent',
      5: 'bg-archived',
    };
    return priorityClasses[priorityId] || 'bg-secondary';
  }

  getStatusClass(statusId: number): string {
    if (!statusId) return 'bg-secondary';

    const statusClasses: { [key: number]: string } = {
      1: 'bg-todo',
      2: 'bg-doing',
      3: 'bg-in-review',
      4: 'bg-done',
      5: 'bg-archived',
    };
    return statusClasses[statusId] || 'bg-secondary';
  }

  get visibleStatuses() {
  if (this.requiresReview || this.getTaskCountForStatus(3) > 0) {
    return this.statuses.filter(s => s.name !== 'Archived');
  }
  return this.statuses.filter(
    s => s.name !== 'Archived' && s.name !== 'In Review'
  );
}

  getConnectedDropLists(currentStatusId?: number | null): string[] {
    const ids = this.statuses
      .filter((status) => status.id !== currentStatusId && status.id !== this.ARCHIVED_STATUS_ID)
      .map((status) => `drop-list-${status.id}`);
    ids.push('drop-list-archived', 'archive-drop');
    return ids;
  }

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
        event.currentIndex,
      );

      // Update the task's status
      const targetStatus = this.statuses.find((s) => s.id === targetStatusId);
      if (targetStatus && movedTask) {
        movedTask.status = targetStatus;

        const taskIndex = this.tasks.findIndex((t) => t.id === movedTask.id);
        if (taskIndex !== -1) {
          this.tasks[taskIndex].status = targetStatus;
        }

        this.updateTaskStatus(movedTask, targetStatus);

        console.log(`Task "${movedTask.name}" moved to status "${targetStatus.name}"`);
      }
    }
  }

  onArchiveDrop(event: CdkDragDrop<TaskModel[]>) {
    const task = event.item.data as TaskModel;
    if (!task) return;

    if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        this.archivedTasks,
        event.previousIndex,
        event.currentIndex,
      );

      task.status =
        this.statuses.find((s) => s.id === this.ARCHIVED_STATUS_ID) ||
        ({ id: this.ARCHIVED_STATUS_ID, name: 'Archived' } as StatusModel);

      this.removeTaskFromTasksByStatus(task);

      this.dashBoardService
        .updateTaskStatus(task.id, this.ARCHIVED_STATUS_ID)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => console.log(`Task ${task.id} archived`),
          error: (err) => {
            console.error('Failed to archive task', err);
            this.loadDashboardData();
          },
        });
    }

    this.archiveDropHover = false;
  }

  onArchivedColumnDrop(event: CdkDragDrop<TaskModel[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const task = event.item.data as TaskModel;
    if (!task) return;

    task.status =
      this.statuses.find((s) => s.id === this.ARCHIVED_STATUS_ID) ||
      ({ id: this.ARCHIVED_STATUS_ID, name: 'Archived' } as StatusModel);
    this.removeTaskFromTasksByStatus(task);

    this.dashBoardService
      .updateTaskStatus(task.id, this.ARCHIVED_STATUS_ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log(`Task ${task.id} archived via column`),
        error: (err) => {
          console.error('Failed to archive task', err);
          this.loadDashboardData();
        },
      });
  }

  onArchiveEnter(event: any) {
    this.archiveDropHover = true;
  }

  onArchiveExit(event: any) {
    this.archiveDropHover = false;
  }

  toggleArchivedColumn() {
    this.showArchived = !this.showArchived;
  }

  private removeTaskFromTasksByStatus(task: TaskModel) {
    if (!this.tasksByStatus) return;
    for (const key of Object.keys(this.tasksByStatus)) {
      const arr = this.tasksByStatus[Number(key)];
      const idx = arr.findIndex((t) => t.id === task.id);
      if (idx !== -1) {
        arr.splice(idx, 1);
        break;
      }
    }
  }

  private updateTaskStatus(task: TaskModel, newStatus: StatusModel): void {
    this.dashBoardService
      .updateTaskStatus(task.id, newStatus.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Task status updated successfully');
        },
        error: (err) => {
          console.error('Failed to update task status', err);
          this.loadDashboardData();
        },
      });
  }

  getPriorityName(priorityId?: number | null): string {
    if (!priorityId) return 'Unassigned';
    const priority = this.priorities.find((p) => p.id === priorityId);
    if (!priority) return 'Unassigned';
    return priority.name || `Unknown`;
  }

  getUserName(userId?: number | null): string {
    if (!userId) return 'Unassigned';
    const user = this.users.find((u) => u.id === userId);
    if (!user) return 'Unassigned';
    return user.name || `Unknown`;
  }

  prepareUsersForArchivedModal(): { id: number; name: string }[] {
    return this.users.map((u) => ({ id: u.id, name: u.name || 'Unknown' }));
  }

  getUserEmail(userId?: number | null): string {
    if (!userId) return '';
    const user = this.users.find((u) => u.id === userId);
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

  createTask(statusId: number) {
    this.isCreateModalOpen = true;
    this.newTaskStatusId = statusId
  }

  onCreateModalSave(createdTask: TaskModel) {
    this.isCreateModalOpen = false;
    if (!createdTask) return;
    this.dashBoardService
      .createTask(createdTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshData();
        },
        error: (err) => {
          console.error('Failed to create task', err);
        },
      });
  }

  onCreateModalCancel() {
    this.isCreateModalOpen = false;
  }

  onModalSave(updatedTask: TaskModel) {
    this.isEditModalOpen = false;
    if (!updatedTask) return;
    this.dashBoardService
      .updateTask(updatedTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshData();
        },
        error: (err) => {
          console.error('Failed to update task', err);
        },
      });
  }

  onModalCancel() {
    this.isEditModalOpen = false;
    this.selectedTask = null;
  }

  onOpenMemberSidebar() {
  this.memberSidebarService.open();
  console.log(this.users);
  }

  onCloseMemberSidebar() {
    this.memberSidebarService.close();
  }

  onRemoveMember(userId: number) {
    console.log('Removing user:', userId);
    this.dashBoardService.removeUserFromDashboard(userId, this.dashboardId).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to remove user from dashboard', err);
      },
    });
  }

  onUpdateMemberPermission(event: {id: number, roleId: number}) {
    console.log('Updating user:', event.id, 'to role ID:', event.roleId);
    this.dashBoardService.changeUserRoleFromDashboard(event.id, this.dashboardId, event.roleId).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to update user role in dashboard', err);
      },
    });
  }

}
