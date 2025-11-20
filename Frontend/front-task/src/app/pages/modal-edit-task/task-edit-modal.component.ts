import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskModel } from '../../Models/Task/task.model';
import { UserModel } from '../../Models/User/user.model';
import { PriorityModel } from '../../Models/Priority/priority.model';

@Component({
  selector: 'app-task-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-edit-modal.component.html',
  styleUrls: ['./task-edit-modal.component.css'],
})
export class TaskEditModalComponent {
  @Input() task!: TaskModel;
  @Input() users: UserModel[] = [];
  @Input() priorities: PriorityModel[] = [];

  @Output() save = new EventEmitter<TaskModel>();
  @Output() cancel = new EventEmitter<void>();

  editedTask!: TaskModel;

  ngOnChanges() {
    this.editedTask = new TaskModel({ ...this.task });
  }

  onSave() {
    this.save.emit(this.editedTask);
  }

  onCancel() {
    this.cancel.emit();
  }
}
