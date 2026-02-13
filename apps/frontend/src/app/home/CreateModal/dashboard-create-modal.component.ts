import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
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
export class DashboardCreateModalComponent implements OnChanges {
  @Output() save = new EventEmitter<{ name: string; description: string ; requiresReview : boolean; preset: string }>();
  @Output() cancel = new EventEmitter<void>();
  newDashboardData = { name: '', description: '', requiresReview: false, preset: '' };
  selectedImageId: string = '';
dashboardImages = [
  { id: 'preset1', url: 'assets/images/preset1.jpg', label: 'Classic' },
  { id: 'preset2', url: 'assets/images/preset2.jpg', label: 'Minimal' },
  { id: 'preset3', url: 'assets/images/preset3.jpg', label: 'Data Heavy' },
  { id: 'preset4', url: 'assets/images/preset4.jpg', label: 'Modern' },
  { id: 'preset5', url: 'assets/images/preset5.jpg', label: 'Elegant' },
];

  ngOnChanges() {
    this.newDashboardData = { name: '', description: '', requiresReview: false, preset: '' };
  }

  Save() {
    this.save.emit(this.newDashboardData);
  }

  Cancel() {
    this.cancel.emit();
  }

  selectTemplate(imageId: string) {
  this.selectedImageId = imageId;
  this.newDashboardData.preset = this.selectedImageId;
  console.log('Selected template:', this.newDashboardData.preset);

}
  
}

