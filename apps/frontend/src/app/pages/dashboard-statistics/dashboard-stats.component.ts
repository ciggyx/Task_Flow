import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importa DatePipe
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
  providers: [DatePipe], // Añade DatePipe a providers
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.css']
})
export class DashboardStatsComponent implements OnInit, OnDestroy {
  activeRange: 'week' | 'month' | 'year' = 'month';
  dashboardId!: number;
  
  // Fechas iniciales (por defecto: mes actual)
  startDate: string = '';
  endDate: string = '';

  loading: boolean = false;
  data: DashboardStatsData | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardStatsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private datePipe: DatePipe
  ) {
    this.setRange('month'); // Inicializa con el mes actual
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.dashboardId = Number(id);
          this.zone.run(() => this.fetchStats());
        }
      });
  }

  // Método para configurar rangos rápidos
  setRange(type: 'week' | 'month' | 'year') {
  this.activeRange = type; // Guardamos cuál está activo
  
  const now = new Date();
  let start = new Date();
  const end = now; 

  if (type === 'week') {
    start.setDate(now.getDate() - 7);
  } else if (type === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (type === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
  }

  this.startDate = this.datePipe.transform(start, 'yyyy-MM-dd') || '';
  this.endDate = this.datePipe.transform(end, 'yyyy-MM-dd') || '';

  if (this.dashboardId) this.fetchStats();
}

  getMaxFinished(): number {
    if (!this.data || !this.data.priorityBreakdown) return 1;
    const counts = [
      this.data.priorityBreakdown.urgent?.finished || 0,
      this.data.priorityBreakdown.high?.finished || 0,
      this.data.priorityBreakdown.medium?.finished || 0,
      this.data.priorityBreakdown.low?.finished || 0
    ];
    const max = Math.max(...counts);
    return max > 0 ? max : 1; // Evitamos división por cero
  }

  // 2. Modificamos el cálculo del porcentaje para que sea relativo al máximo
  getPriorityWidth(finished: number): number {
    const max = this.getMaxFinished();
    return (finished / max) * 100;
  }

  fetchStats() {
    if (!this.dashboardId || !this.startDate || !this.endDate) return;

    this.loading = true;
    this.errorMessage = null;
    this.data = null;
    this.cdr.detectChanges(); // Forzamos el estado de carga

    this.dashboardService.getStats(this.dashboardId, this.startDate, this.endDate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          // El detectChanges() aquí es crucial para cerrar el loader
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          // Asignamos datos y forzamos el renderizado inmediatamente
          this.data = res ? res : this.getEmptyState();
          this.cdr.markForCheck(); // Notifica que hay cambios
          this.cdr.detectChanges(); // Ejecuta la detección
        },
        error: (err) => {
          this.errorMessage = 'Could not fetch stats.';
          this.cdr.detectChanges();
        }
      });
  }

  getPriorityPercent(priority: PriorityDetail | undefined): number {
    if (!priority || !priority.total || priority.total === 0) return 0;
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
      startDate: this.startDate,
      endDate: this.endDate,
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
        // Si no hay tareas, usamos una clase neutra (gris/text-muted)
        if (!this.data || (this.data.createdInPeriod === 0 && this.data.finishedInPeriod === 0)) {
            return 'neutral-stat'; 
        }
        
        const value = parseFloat(efficiency?.replace('%', '') || '0');
        if (value <= 40) return 'red-stat';
        if (value <= 70) return 'yellow-stat';
        return 'green-stat';
    }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}