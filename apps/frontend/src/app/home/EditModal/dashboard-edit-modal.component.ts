import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardModel } from '../../Models/Dashboard/dashboard.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard-edit-modal.component.html',
  styleUrls: ['./dashboard-edit-modal.component.css'],
})
export class DashboardEditModalComponent implements OnChanges {
  @Input() dashboard!: DashboardModel;

  @Output() save = new EventEmitter<DashboardModel>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<DashboardModel>();

  dashboardImages = [
  { id: 'preset1', url: 'assets/images/preset1.jpg', label: 'Classic' },
  { id: 'preset2', url: 'assets/images/preset2.jpg', label: 'Minimal' },
  { id: 'preset3', url: 'assets/images/preset3.jpg', label: 'Data Heavy' },
  { id: 'preset4', url: 'assets/images/preset4.jpg', label: 'Modern' },
  { id: 'preset5', url: 'assets/images/preset5.jpg', label: 'Elegant' },
  ];


  editedDashboard!: DashboardModel;
  selectedImageId: string = '';

  ngOnChanges() {
    this.editedDashboard = new DashboardModel(
      this.dashboard.id,
      this.dashboard.name,
      this.dashboard.description,
      this.dashboard.requiresReview,
      this.dashboard.preset
    );
  }

  Save() {
    this.save.emit(this.editedDashboard);
  }

  Cancel() {
    this.cancel.emit();
  }

  onDelete() {
    this.delete.emit(this.editedDashboard);
  }

    selectTemplate(imageId: string) {
    this.selectedImageId = imageId;
    this.editedDashboard.preset = this.selectedImageId;
    }
  }