// archived-tasks-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskModel } from '../../../Models/Task/task.model';
import { UserModel } from '../../../Models/User/user.model';
import { DashBoardService } from '../../../services/dashboard.service';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-archived-tasks-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './archived-tasks-modal.html',
  styleUrls: ['./archived-tasks-modal.css'],
})
export class ArchivedTasksModalComponent {
  @Input() archivedTasks: TaskModel[] = [];
  @Input() connectedDropLists: string[] = [];
  @Input() show: boolean = false;
  @Input() users: UserModel[] = [];
  @Output() close = new EventEmitter<void>();
  private destroy$ = new Subject<void>();

  readonly ARCHIVED_STATUS_ID = 5;

  constructor(private dashBoardService: DashBoardService) {}

  onDrop(event: CdkDragDrop<TaskModel[]>) {
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

    // update in-memory
    task.status = { id: this.ARCHIVED_STATUS_ID, name: 'Archived' } as any;

    // persist as archived
    this.dashBoardService
      .updateTaskStatus(task.id, this.ARCHIVED_STATUS_ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log(`Archived task ${task.id}`),
        error: (err) => {
          console.error('Failed to persist archive', err);
        },
      });
  }
  // add inside class in archived-tasks-modal.component.ts
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
    console.log('Getting user name for userId:', userId);
    console.log('Available users:', this.users);
    if (!userId) return 'Unassigned';
    const user = this.users.find((u) => u.id === userId);
    if (!user) return 'Unassigned';
    return user.name || `Unknown`;
  }

  onClose() {
    this.close.emit();
  }
}
