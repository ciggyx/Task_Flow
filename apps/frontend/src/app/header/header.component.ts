import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, Event as RouterEvent} from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarService } from '../services/sidebar.service';
import { filter } from 'rxjs/internal/operators/filter';
import { InviteModalComponent } from './invite-people/invite-people.component';
import { DashBoardService } from '../services/dashboard.service';
import { AppNotification, NotificationService } from '../services/notifications.service';

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

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sidebarService: SidebarService,
    private dashBoardService: DashBoardService,
    private notificationService: NotificationService,
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
        console.log('No profile image found in localStorage, using default.');
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
    });
  }

  checkRoute(url: string): void {
    this.showInviteButton = url.includes('/dashboard'); 
  }

  invitePeople(): void{
    this.isInviteModalOpen = true;
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
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }

  viewNotifications(): void {
    console.log('Abriendo notificaciones');
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation(); 
    this.notificationService.markAsRead(id);
  }
  
  markAllRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  toggleMenu(): void {
    this.sidebarService.toggle();
  }
}
