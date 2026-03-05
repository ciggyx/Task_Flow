import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, Event as RouterEvent} from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarService } from '../services/sidebar.service';
import { filter } from 'rxjs/internal/operators/filter';
import { InviteModalComponent } from './invite-people/invite-people.component';
import { DashBoardService } from '../services/dashboard.service';
import { AppNotification, NotificationService } from '../services/notifications.service';
import { FriendshipService } from '../services/friendship.service';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../Models/User/user.model';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, SidebarComponent, InviteModalComponent],
})
export class HeaderComponent implements OnInit {
  profileImage: string | null = null;
  isSidebarOpen = false;
  isInviteModalOpen = false;
  showInviteButton = false;
  notifications: AppNotification[] = [];
  unreadCount: number = 0;
  showStatsButton = false; 
  currentDashboardId: string | null = null;
  userInitials: string = '??';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sidebarService: SidebarService,
    private dashBoardService: DashBoardService,
    private notificationService: NotificationService,
    private friendshipService: FriendshipService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private profileService: ProfileService,
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => { // TypeScript ya infiere aquí que event es NavigationEnd
      this.checkRoute(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.profileImage = localStorage.getItem('profileImage');
      if (!this.profileImage) {
        this.profileImage = 'assets/images/default-pfp.png';
      }
    }

    this.sidebarService.isOpen$.subscribe((state) => {
      this.isSidebarOpen = state;
    });
    this.checkRoute(this.router.url);

    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });

    this.notificationService.unreadCount$.subscribe(count => {
    this.unreadCount = count;
    this.cd.detectChanges();
  });
  this.setUserData();

  }

  checkRoute(url: string): void {
    const isDashboard = url.includes('/dashboard/');
    this.showInviteButton = isDashboard;
    this.showStatsButton = isDashboard; // Se muestra si estamos en un dashboard

    if (isDashboard) {
      const parts = url.split('/');
      // Asumimos que la URL es /dashboard/:id o /dashboard/stats/:id
      this.currentDashboardId = parts[parts.length - 1];
    }
  }

  invitePeople(): void{
    this.isInviteModalOpen = true;
  }

  goToStats(): void {
    if (this.currentDashboardId) {
      this.router.navigate([`/dashboard/stats/${this.currentDashboardId}`]);
    }
  }

  handleInviteUser(email:string):void{
    const urlParts = this.router.url.split('/');
    const dashboardId = parseInt(urlParts[urlParts.length - 1], 10);

    if (isNaN(dashboardId)) {
      console.error('No se pudo encontrar un dashboardId válido en la URL');
      return;
    }
    this.dashBoardService.inviteUser(email, dashboardId).subscribe({
    next: () => {
      this.isInviteModalOpen = false;
    },
    error: (err) => {
      console.error('Error al enviar la invitación', err);
    }
  });
  }

  goToProfile(): void {
  const user = this.authService.currentUserValue;
  if (user && user.sub) {
    this.router.navigate([`/profile/${user.sub}`]);
  } else {
    this.router.navigate(['/auth/login']);
  }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  markAsRead(note: AppNotification, event: Event): void {
      // Si se hace click en la fila general, marcamos como leída
      event.stopPropagation(); 
      this.notificationService.markAsRead(note.id);
      
      if (note.type === 'INVITE' && note.relatedResourceId) {
        this.router.navigate([`/invitation/accept`, note.relatedResourceId]);
      } 
      // Si es FRIEND_REQUEST y clickean la fila (no los botones), solo marca leída (o podrías ir al perfil)
  }

  handleFriendRequest(friendshipId: string | undefined, accept: boolean, event: Event, notificationId: number) {
    event.stopPropagation(); // Evita que se dispare el click del <li> padre

    if (!friendshipId) {
      console.error('No friendship ID provided');
      return;
    }

    if (accept) {
      this.friendshipService.accept(friendshipId).subscribe({
        next: () => {
          // Marcar la notificación como leída para que desaparezcan los botones visualmente
          this.notificationService.markAsRead(notificationId);
          // Opcional: Mostrar un toast de éxito
        },
        error: (err) => console.error('Error aceptando amistad', err)
      });
    } else {
      this.friendshipService.reject(friendshipId).subscribe({
        next: () => {
          // También marcamos como leída o la eliminamos
          this.notificationService.markAsRead(notificationId);
        },
        error: (err) => console.error('Error rechazando amistad', err)
      });
    }
  }
  
  markAllRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  toggleMenu(): void {
    this.sidebarService.toggle();
  }

  setUserData(): void {
  const user = this.authService.currentUserValue;
  if (!user || !user.sub) {
    this.userInitials = '??';
    return;
  }
  this.profileService.getUserData(user.sub).subscribe(userData => {
    if (userData && userData.name) {
      this.userInitials = userData.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      this.cd.detectChanges();
    } else {
      this.userInitials = '??';
    }
  });
  }


}
