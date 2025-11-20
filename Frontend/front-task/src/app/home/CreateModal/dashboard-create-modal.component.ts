import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard-create-modal.component.html',
  styleUrls: ['./dashboard-create-modal.component.css'],
})
export class DashboardCreateModalComponent {
  @Output() save = new EventEmitter<{ name: string; description: string }>();
  @Output() cancel = new EventEmitter<void>();
  newDashboardData = { name: '', description: '' };

  ngOnChanges() {
    this.newDashboardData = { name: '', description: '' };
  }

  Save() {
    this.save.emit(this.newDashboardData);
  }

  Cancel() {
    this.cancel.emit();
  }
}
