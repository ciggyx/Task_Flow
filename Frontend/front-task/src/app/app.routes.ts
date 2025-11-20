import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home';
import { DashboardComponent } from './pages/DashBoard/DashBoard';
import { ProfileComponent } from './pages/profile/profile.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { CompletedTasksComponent } from './pages/completed-tasks/completed-tasks.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'completed-tasks', component: CompletedTasksComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
