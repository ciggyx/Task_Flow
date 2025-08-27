import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskModel } from '../Models/Task/task.model';
import { DashBoardService } from '../services/dashboard.service';
import { finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './DashBoard.html',
  styleUrls: ['./DashBoard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardId!: number;
  tasks: TaskModel[] = [];
  private destroy$ = new Subject<void>();
  loading = false;
  constructor(private route: ActivatedRoute, private dashBoardService: DashBoardService) {}

     ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((pm: ParamMap) => {
          const id = Number(pm.get('id'));
          this.dashboardId = id;
          return this.loadTasksObservable(id);
        })
      )
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
        },
        error: (err) => {
          console.error('Failed to load tasks', err);
          this.tasks = [];
        }
      });
  }

  private loadTasksObservable(id: number) {
    this.loading = true;
    return this.dashBoardService.getTasks(id).pipe(
      takeUntil(this.destroy$), finalize(() => (this.loading = false)));
  }

  saveTask(task: TaskModel) {
    console.log('edit', task);
  }

  // Placeholder for opening an edit UI
  editTask(task: TaskModel) {
    // e.g. open modal and call saveTask(updatedModel) after editing
    console.log('edit', task);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
