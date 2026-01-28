import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskModel } from '../../Models/Task/task.model';
import { UserModel } from '../../Models/User/user.model';
import { PriorityModel } from '../../Models/Priority/priority.model';

@Component({
  selector: 'app-task-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-create-modal.component.html',
  styleUrls: ['./task-create-modal.component.css'],
})
export class TaskCreateModalComponent implements OnChanges {
  
  @Input() statusId: number;
  @Input() dashboardId: number;
  @Input() users: UserModel[] = [];
  @Input() priorities: PriorityModel[] = [];

  @Output() save = new EventEmitter<TaskModel>();
  @Output() cancel = new EventEmitter<void>();

  createdTask!: TaskModel;

  ngOnInit() {
     this.createdTask = new TaskModel({name: 'new task', dashboardId : this.dashboardId, statusId : this.statusId});
  }

  ngOnChanges() {
    this.createdTask = new TaskModel({ ...this.createdTask });
  }

  onSave() {
    this.save.emit(this.createdTask);
  }

  onCancel() {
    this.cancel.emit();
  }
}
