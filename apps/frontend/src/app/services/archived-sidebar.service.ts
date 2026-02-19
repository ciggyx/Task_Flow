import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class archivedSidebarService {
  private archivedSidebarOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.archivedSidebarOpen.asObservable();

  open() { this.archivedSidebarOpen.next(true); }
  close() { this.archivedSidebarOpen.next(false); }
  toggle() { this.archivedSidebarOpen.next(!this.archivedSidebarOpen.value); }
}