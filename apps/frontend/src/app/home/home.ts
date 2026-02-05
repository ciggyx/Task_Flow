import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
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
import { Inject, PLATFORM_ID } from '@angular/core';

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
    @Inject(PLATFORM_ID) private platformId: Object,
    private sidebarService: SidebarService,
    private router: Router,
    private HomeService: HomeService,
    private cdr: ChangeDetectorRef
  ) { }

  private destroy$ = new Subject<void>();
  isSidebarOpen = false;
  showEditModal = false;
  showCreateModal = false;
  dashboardToEdit: DashboardModel | null = null;
  loading = false;
  useMock = false;
  ownedDashboards: DashboardModel[] | null = [];
  sharedDashboards: DashboardModel[] | null = [];

  private loadDashboardData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    combineLatest([
      this.HomeService.getOwnedDashboardsByUser(),
      this.HomeService.getSharedDashboardsByUser(),
    ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ([ownedDashboards, sharedDashboards]) => {
          this.ownedDashboards = ownedDashboards;
          this.sharedDashboards = sharedDashboards;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.log('Error Source:', err.url);
          this.cdr.markForCheck();
        }
      });
  }

  ngOnInit() {
    this.sidebarService.isOpen$.subscribe((state) => {
      this.isSidebarOpen = state;
      this.cdr.markForCheck();
    });
    this.loadDashboardData();
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
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  newDashboard(name: string, description: string, requiresReview: boolean) {
    this.HomeService.newDashboard(name, description, requiresReview)
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

  deleteDashboard(dashboard: DashboardModel) {
    this.HomeService.deleteDashoard(dashboard)
      .subscribe({
        next: data => {
          this.HomeService.status.set('Delete successful');
          this.closeEditModal();
          this.loadDashboardData();
        },
        error: error => {
          this.HomeService.errorMessage.set(error.message);
          console.error('There was an error!', error);
        }
      })

  }
}