import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardModel } from '../../Models/Dashboard/dashboard.model';
import { DragDropModule } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-dashboard-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard-edit-modal.component.html',
  styleUrls: ['./dashboard-edit-modal.component.css']
})

export class DashboardEditModalComponent {
  @Input() dashboard!: DashboardModel;

  @Output() save = new EventEmitter<DashboardModel>();
  @Output() cancel = new EventEmitter<void>();

  editedDashboard!: DashboardModel;

  ngOnChanges() {
    this.editedDashboard = new DashboardModel(this.dashboard.id, this.dashboard.name, this.dashboard.description);
  }

  Save() {
    this.save.emit(this.editedDashboard);
  }

  Cancel() {
    this.cancel.emit();
  }
}
