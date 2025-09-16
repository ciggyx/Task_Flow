import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../services/sidebar.service';
import { EditDashboardModalComponent } from './modal/edit-dashboard-modal.component'; // 1. Import the modal
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CommonModule, EditDashboardModalComponent], // 2. Add it to imports
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  constructor(private sidebarService: SidebarService, private router: Router) {}

  isSidebarOpen = false;
  showModal = false;
  
  // This will hold the dashboard being edited
  dashboardToEdit: any = null;

  // Let's assume you have a list of dashboards
  myDashboards = [
    { name: 'Dashboard 1', image: 'https://via.placeholder.com/150' }
  ];
  sharedDashboards = [
    { name: "Jame's Dashboard", image: 'https://via.placeholder.com/150' }
  ];


  ngOnInit() {
    this.sidebarService.isOpen$.subscribe(state => this.isSidebarOpen = state);
  }

  goToDashboards() {
    this.router.navigate(['/dashboards']);
  }

  // Correctly open the modal and set the dashboard to edit
  openEditModal(dashboard: any) {
    this.dashboardToEdit = dashboard;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.dashboardToEdit = null;
  }

  // The event payload is correctly typed now
  updateDashboard(updatedData: { name: string; image: string }) {
    console.log('Dashboard actualizado:', updatedData);
    if (this.dashboardToEdit) {
      this.dashboardToEdit.name = updatedData.name;
      this.dashboardToEdit.image = updatedData.image;
    }
    this.closeModal(); // Close the modal after saving
  }
}