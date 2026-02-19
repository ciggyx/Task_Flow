import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { DashboardComponent } from './pages/DashBoard/DashBoard';
import { ProfileComponent } from './pages/profile/profile.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AcceptInvitationComponent } from './header/invite-people/accept.invitation.component';
import { DashboardStatsComponent } from './pages/dashboard-statistics/dashboard-stats.component';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'friends', component: FriendsComponent },
  { path: 'invitation/accept/:id', component: AcceptInvitationComponent},
  { path: 'dashboard/stats/:id', component : DashboardStatsComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
