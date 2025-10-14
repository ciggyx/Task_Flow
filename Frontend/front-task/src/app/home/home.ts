import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../services/sidebar.service';
import { EditDashboardModalComponent } from './modal/edit-dashboard-modal.component'; // 1. Import the modal
import { Router } from '@angular/router';
import { DashboardModel, DashboardDTO } from '../Models/Dashboard/dashboard.model';
import { HomeService } from "../services/home.service";
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { finalize, pipe, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CommonModule, EditDashboardModalComponent], // 2. Add it to imports
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  constructor(private sidebarService: SidebarService, private router: Router, private HomeService: HomeService) {}
  
  private destroy$ = new Subject<void>();
  isSidebarOpen = false;
  showModal = false;
  dashboardToEdit: any = null;
  loading= false
  useMock = true
  userId: number | null = null; // Store the user ID here
  ownedDashboards: DashboardModel[] | null = [];
  sharedDashboards: DashboardModel[] | null = [];

   private loadDashboardData(): void {
    this.loading = true;  
    combineLatest([
        this.HomeService.getOwnedDashboardsByUser(this.userId),
        this.HomeService.getSharedDashboardsByUser(this.userId),
      ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: ([ownedDashboards, sharedDashboards]) => {
          this.ownedDashboards = ownedDashboards;
          this.sharedDashboards = sharedDashboards;
          console.log('Dashboard data loaded', { ownedDashboards, sharedDashboards });
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
        }
    });
    }

  ngOnInit() {
    this.sidebarService.isOpen$.subscribe(state => this.isSidebarOpen = state);
    if (!this.useMock) {this.loadUserID()}
    else {this.userId = 1}
    this.loadDashboardData();
  }

  loadUserID() {
    const token = localStorage.getItem('token');
    if (token) {
      this.HomeService.getUserIDByToken(token).subscribe({
        next: (userId) => {
          this.userId = userId;
          console.log('User ID loaded:', userId);
        },
        error: (err) => {
          console.error('Failed to load user ID', err);
        }
      });
    }
  }

  goToDashboard(dashboardId: number) {
  this.router.navigateByUrl(`/dashboard/${dashboardId}`);
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