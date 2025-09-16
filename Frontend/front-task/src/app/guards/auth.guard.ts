import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta a tu AuthService sea correcta

@Injectable({
  providedIn: 'root', // Esto hace que el guardia esté disponible en toda la aplicación
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Verifica si el usuario está autenticado usando tu AuthService
    if (this.authService.isAuthenticated()) {
      return true; // El usuario está autenticado, permite el acceso a la ruta
    } else {
      // El usuario NO está autenticado, redirige a la página de login
      // Y retorna un UrlTree para indicar la redirección
      console.warn('Acceso denegado. Redirigiendo al login.');
      return this.router.createUrlTree(['/auth/login']); // Asegúrate que esta sea la ruta correcta a tu componente de login
    }
  }
}