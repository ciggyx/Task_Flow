import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MemberSidebarService {
  private memberSidebarOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.memberSidebarOpen.asObservable();

  open() { this.memberSidebarOpen.next(true); }
  close() { this.memberSidebarOpen.next(false); }
  toggle() { this.memberSidebarOpen.next(!this.memberSidebarOpen.value); }
}