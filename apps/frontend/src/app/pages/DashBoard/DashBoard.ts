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
import { ArchivedTasksSidebarComponent } from './Archived-task-sidebar/archived-tasks-sidebar';
import { ChangeDetectorRef } from '@angular/core';
import { MemberSidebarService } from '../../services/member-sidebar.service';
import { MemberSidebarComponent } from './Member-sidebar/member-sidebar';
import { participantTypeModel } from '../../Models/ParticipantType/participantType.model';
import { archivedSidebarService } from '../../services/archived-sidebar.service';

interface TaskImage {
  id: number;
  url: string;
}

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
    ArchivedTasksSidebarComponent,
    MemberSidebarComponent,
  ],
  templateUrl: './DashBoard.html',
  styleUrls: ['./DashBoard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardId!: number;
  dashboardMeta : {id: number, name: string, description: string, requiresReview: boolean} = {id: 0, name: '', description: '', requiresReview: false};
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
  readonly DEFAULT_STATUS_ID = 4;
  readonly API_BASE_URL = 'http://localhost:3000';
  requiresReview = false
  archivedTasks: TaskModel[] = [];
  isArchiveSideBarOpen = false;
  archiveDropHover = false;
  isCreateModalOpen = false;
  newTaskStatusId = 1;
  isMemberSidebarOpen = false;
  isLightboxOpen = false;
  lightboxImages: TaskImage[] = []; 
  currentImageIndex = 0;
  

  constructor(
    private sidebarService: SidebarService,
    private route: ActivatedRoute,
    private dashBoardService: DashBoardService,
    private cdr: ChangeDetectorRef,
    private memberSidebarService: MemberSidebarService,
    private archivedSidebarService: archivedSidebarService,
  ) {}

  ngOnInit(): void {
    this.archivedSidebarService.isOpen$
    .pipe(takeUntil(this.destroy$))
    .subscribe((state) => {
      this.isArchiveSideBarOpen = state;
      this.cdr.markForCheck();
    });
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
    this.dashBoardService.getParticipantTypes(),
    this.dashBoardService.getDashboardDetails(this.dashboardId),
  ])
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    )
    .subscribe({
      next: ([statuses, tasks, users, priorities, participantTypes, details]) => {
        this.statuses = statuses;
        this.users = users;
        this.priorities = priorities;
        this.archivedTasks = tasks.filter((t) => t.statusId === this.ARCHIVED_STATUS_ID);
        this.tasks = tasks.filter((t) => t.statusId !== this.ARCHIVED_STATUS_ID);
        this.participantTypes = participantTypes;
        this.dashboardMeta = details;
        this.requiresReview = this.dashboardMeta.requiresReview;
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

      }
    }
  }

  private updateTaskStatus(task: TaskModel, newStatus: StatusModel): void {
    this.dashBoardService
      .updateTaskStatus(task.id, newStatus.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
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
  }

  onCloseMemberSidebar() {
    this.memberSidebarService.close();
  }

  onOpenArchivedSidebar() {
  this.archivedSidebarService.open();
  }

  onCloseArchivedSidebar() {
    this.archivedSidebarService.close();
    this.refreshData();
  }

  onRemoveMember(userId: number) {
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
    this.dashBoardService.changeUserRoleFromDashboard(event.id, this.dashboardId, event.roleId).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to update user role in dashboard', err);
      },
    });
  }

  archiveTask(task: TaskModel) {
    if (!task) return;
    this.dashBoardService
      .updateTaskStatus(task.id, this.ARCHIVED_STATUS_ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshData();
        },
        error: (err) => {
          console.error('Failed to archive task', err);
        },
      });
  }

getTaskImageUrl(imagePath: string): string {
  if (!imagePath) return '';

  // 1. Handle Mock URLs (they already start with http)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // 2. Sanitize the path: Replace ALL backslashes with forward slashes
  // The regex /\\/g looks for backslashes globally
  const sanitizedPath = imagePath.replace(/\\/g, '/');

  // 3. Construct the full URL
  // Ensure there isn't a double slash if your API_BASE_URL already ends with /
  const baseUrl = this.API_BASE_URL.endsWith('/') 
    ? this.API_BASE_URL.slice(0, -1) 
    : this.API_BASE_URL;

  // If the path already starts with a slash, remove it to avoid //
  const cleanPath = sanitizedPath.startsWith('/') 
    ? sanitizedPath.substring(1) 
    : sanitizedPath;

  return `${baseUrl}/${cleanPath}`;
}

openImageLightbox(images: TaskImage[], index: number = 0) {
  this.lightboxImages = images;
  this.currentImageIndex = index;
  this.isLightboxOpen = true;
  
  document.body.style.overflow = 'hidden';
}

closeLightbox() {
  this.isLightboxOpen = false;
  this.lightboxImages = []; // Clear the reference
  document.body.style.overflow = 'auto';
}

  onFileSelected(event: any, task: TaskModel) {
  const files: FileList = event.target.files;
  if (files.length > 0) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    this.dashBoardService.attachFile(task, Array.from(files)).subscribe({
      next: () => {
        this.refreshData();
      },
      error: (err) => {
        console.error('Failed to upload files', err);
      }
    });
  }
}
}
