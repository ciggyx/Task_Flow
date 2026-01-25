import { Component, Input, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../services/sidebar.service';
import { DashboardEditModalComponent } from './EditModal/dashboard-edit-modal.component';
import { Router } from '@angular/router';
import { DashboardModel, DashboardDTO } from '../Models/Dashboard/dashboard.model';
import { HomeService } from '../services/home.service';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { finalize, pipe, Subject, takeUntil } from 'rxjs';
import { DashboardCreateModalComponent } from './CreateModal/dashboard-create-modal.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    DashboardEditModalComponent,
    DashboardCreateModalComponent,
  ], 
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private HomeService: HomeService,
    private authService: AuthService,
  ) {}

  private destroy$ = new Subject<void>();
  isSidebarOpen = false;
  showEditModal = false;
  showCreateModal = false;
  dashboardToEdit: DashboardModel | null = null;
  loading = false;
  useMock = false;
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
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: ([ownedDashboards, sharedDashboards]) => {
          this.ownedDashboards = ownedDashboards;
          this.sharedDashboards = sharedDashboards;
          console.log('Dashboard data loaded', { ownedDashboards, sharedDashboards });
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
        },
      });
  }

  ngOnInit() {
    this.sidebarService.isOpen$.subscribe((state) => (this.isSidebarOpen = state));
    if (!this.useMock) {
      this.loadUserID();
      console.log(this.userId)
    } else {
      this.userId = 7;
    }
    this.loadDashboardData();
  }

  loadUserID() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getUserIDByToken(token).subscribe({
        next: (userId) => {
          this.userId = userId;
          console.log('User ID loaded:', userId);
        },
        error: (err) => {
          console.error('Failed to load user ID', err);
        },
      });
    }
  }

  goToDashboard(dashboardId: number) {
    this.router.navigateByUrl(`/dashboard/${dashboardId}`);
  }

  openEditModal(dashboard: DashboardModel) {
    this.dashboardToEdit = dashboard;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.dashboardToEdit = null;
  }

  openCreateModal() {
    this.showCreateModal = true;
    console.log('Abriendo modal de creación de dashboard');
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  newDashboard(name: string, description: string) {
    console.log('Nuevo Dashboard creado:', { name, description });
    this.HomeService.newDashboard(name, description)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Failed to create new dashboard', err);
        },
      });
    this.closeCreateModal();
  }

  updateDashboard(updatedModel: DashboardModel) {
    this.showEditModal = false;
    if (!updatedModel) return;
    this.HomeService.updateDashboard(updatedModel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Failed to update dashboard', err);
        },
      });
  }
}
