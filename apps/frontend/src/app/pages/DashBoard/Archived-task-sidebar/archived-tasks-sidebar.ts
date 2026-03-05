// archived-tasks-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { TaskModel } from '../../../Models/Task/task.model';
import { UserModel } from '../../../Models/User/user.model';
import { DashBoardService } from '../../../services/dashboard.service';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-archived-tasks-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './archived-tasks-sidebar.html',
  styleUrls: ['./archived-tasks-sidebar.css'],
})
export class ArchivedTasksSidebarComponent {
  @Input() archivedTasks: TaskModel[] = [];
  @Input() isVisible: boolean = false; 
  @Input() users: UserModel[] = [];
  @Output() close = new EventEmitter<void>();
  private destroy$ = new Subject<void>();
  readonly DEFAULT_STATUS_ID = 4;
  readonly ARCHIVED_STATUS_ID = 5;

  constructor(private dashBoardService: DashBoardService) {}

  trackByTask(index: number, task: TaskModel) {
    return task.id || task.name;
  }

  getPriorityClass(priorityId: number): string {
    const priorityClasses: { [key: number]: string } = {
      1: 'bg-low',
      2: 'bg-warning',
      3: 'bg-high',
      4: 'bg-urgent',
      5: 'bg-archived',
    };
    return priorityClasses[priorityId] || 'bg-secondary';
  }

  getUserName(userId?: number | null): string {
    if (!userId) return 'Unassigned';
    const user = this.users.find((u) => u.id === userId);
    if (!user) return 'Unassigned';
    return user.name || `Unknown`;
  }

  onClose() {
    this.close.emit();
  }

  onUnarchive(task: TaskModel) {
  if (!task) return;
  this.dashBoardService
    .updateTaskStatus(task.id, this.DEFAULT_STATUS_ID)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.onClose(); 
      },
      error: (err) => console.error('Failed to unarchive task', err)
    });
}
}
