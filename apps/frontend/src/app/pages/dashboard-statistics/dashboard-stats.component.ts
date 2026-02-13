import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core'; // Añadimos NgZone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DashboardStatsService, DashboardStatsData, PriorityDetail } from '../../services/dashboard-stats.service';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.css']
})
export class DashboardStatsComponent implements OnInit, OnDestroy {
  dashboardId!: number;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  
  loading: boolean = false;
  data: DashboardStatsData | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  years = [2024, 2025, 2026, 2027];

  constructor(
    private dashboardService: DashboardStatsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone // Inyectamos NgZone
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.dashboardId = Number(id);
          // Ejecutamos dentro de la zona para que Angular esté "alerta"
          this.zone.run(() => {
            this.fetchStats();
          });
        }
      });
  }

  fetchStats() {
    if (!this.dashboardId) return;

    // Forzamos el estado de carga dentro de la zona
    this.zone.run(() => {
      this.loading = true;
      this.errorMessage = null;
      this.cdr.markForCheck(); 
    });

    this.dashboardService.getStats(this.dashboardId, this.selectedMonth, this.selectedYear)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.zone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          // La clave es ejecutar la asignación de datos DENTRO de zone.run
          this.zone.run(() => {
            console.log("Datos recibidos en zona:", res);
            this.data = res ? res : this.getEmptyState();
            this.errorMessage = null;
            this.cdr.detectChanges(); // Ahora sí lo va a pintar
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.errorMessage = 'No data found for this period.';
            this.data = null;
            this.cdr.detectChanges();
          });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPriorityPercent(priority: PriorityDetail | undefined): number {
    if (!priority || priority.total === 0) return 0;
    return Math.round((priority.finished / priority.total) * 100);
  }

  private getEmptyState(): DashboardStatsData {
    const emptyDetail = { total: 0, finished: 0 };
    return {
      dashboardName: `Dashboard #${this.dashboardId}`,
      dashboardLink: '',
      createdInPeriod: 0,
      finishedInPeriod: 0,
      dueInPeriod: 0,
      overdue: 0,
      completedOnTime: 0,
      efficiency: "0%",
      month: this.selectedMonth.toString(), 
      year: this.selectedYear.toString(),   
      priorityBreakdown: {
        urgent: { ...emptyDetail },
        high: { ...emptyDetail },
        medium: { ...emptyDetail },
        low: { ...emptyDetail }
      },
      leaderboard: []
    };
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getEfficiencyClass(efficiency: string | undefined): string {
    if (!efficiency) return 'red-stat';
    const value = parseFloat(efficiency.replace('%', ''));
    if (value <= 40) return 'red-stat';
    if (value <= 70) return 'yellow-stat';
    return 'green-stat';
  }
}