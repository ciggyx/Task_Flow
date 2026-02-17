import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../services/sidebar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SidebarComponent implements OnInit {
  constructor(
    private sidebarService: SidebarService,
    private router: Router,
  ) {}

  @Input() isOpen: boolean = false;

  ngOnInit() {
    this.sidebarService.isOpen$.subscribe((state) => (this.isOpen = state));
  }

  goToCompletedTasks() {
    this.sidebarService.close();
    this.router.navigate(['/completed-tasks']);
  }

  goToFriends() {
    this.sidebarService.close();
    this.router.navigate(['/friends']);
  }
  close() {
    this.sidebarService.close();
  }
  goHome() {
    this.sidebarService.close();
    this.router.navigate(['/home']);
  }
}
