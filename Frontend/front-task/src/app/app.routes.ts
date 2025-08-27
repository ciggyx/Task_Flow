import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home';
import { DashboardComponent } from './DashBoard/DashBoard';

export const routes: Routes = [
  {path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),}, 
  {path: 'home', component: HomeComponent,},
  {path: '', component: HomeComponent,},
  { path: 'dashboard/:id', component: DashboardComponent }

]
