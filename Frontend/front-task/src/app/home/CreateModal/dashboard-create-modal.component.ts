import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard-create-modal.component.html',
  styleUrls: ['./dashboard-create-modal.component.css']
})
export class DashboardCreateModalComponent implements AfterViewInit {
  @Output() save = new EventEmitter<{ name: string; description: string }>();
  @Output() cancel = new EventEmitter<void>();
  newDashboardData = { name: '', description: '' };

  @ViewChild(CdkDrag) drag?: CdkDrag;

  ngAfterViewInit() {
    // ensure it's centered when first shown
    setTimeout(() => this.drag?.reset(), 0);
  }

  // call this from parent if you recreate the modal and want to recenter
  public resetPosition(): void {
    this.drag?.reset();
  }

  Save() { this.save.emit(this.newDashboardData); }
  Cancel() { this.cancel.emit(); }
}
