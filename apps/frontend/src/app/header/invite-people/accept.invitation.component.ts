// invitation-accept.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashBoardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-accept-invitation',
  template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3">Procesando tu invitación...</p>
      </div>
    </div>
  `
})
// invitation-accept.component.ts
export class AcceptInvitationComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashBoardService,
  ) {}

  ngOnInit() {
    const invitationId = this.route.snapshot.paramMap.get('id');
    
    if (!invitationId) {
      console.error("ID de invitación no encontrado en la URL");
      this.router.navigate(['/dashboard']);
      return;
    }

    this.processInvite(invitationId);
  }

  private processInvite(id: string) {
    this.dashboardService.acceptInvitation(id).subscribe({
      next: (res) => {
        // Si el backend devuelve el ID del dashboard, vamos allí. 
        // Si no, al dashboard general.
        const target = res.dashboardId ? ['/dashboard', res.dashboardId] : ['/dashboard'];
        this.router.navigate(target);
      },
      error: (err) => {
        if (err.status === 401) {
          // No está logueado: Redirigir al login guardando la ruta actual
          this.router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: this.router.url } 
          });
        } else {
          // Error de lógica (UUID vencido, etc.)
          console.error("Error al procesar invitación:", err);
          this.router.navigate(['/dashboard']); 
        }
      }
    });
  }
}