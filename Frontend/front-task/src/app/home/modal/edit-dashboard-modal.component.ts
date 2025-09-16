import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-dashboard-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-dashboard-modal.component.html',
  styleUrls: ['./edit-dashboard-modal.component.css']
})
export class EditDashboardModalComponent {
  @Input() dashboard: { name: string; image: string } = { name: '', image: '' };
  @Output() onSave = new EventEmitter<{ name: string; image: string }>();
  @Output() onClose = new EventEmitter<void>();

  save() {
    // Emitimos los datos actualizados
    this.onSave.emit({ name: this.dashboard.name, image: this.dashboard.image });
    this.close();
  }

  close() {
    this.onClose.emit();
  }
}
