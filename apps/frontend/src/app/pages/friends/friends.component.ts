import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HeaderComponent } from '../../header/header.component';
import { SidebarService } from '../../services/sidebar.service';
import { FriendshipModel, FriendshipDTO } from '../../Models/Friendship/friendship.model';
import { FriendshipService } from '../../services/friendship.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent {
  constructor(
  private sidebarService: SidebarService,
  private friendshipService: FriendshipService,
  private cdr: ChangeDetectorRef,
  private router: Router)
  { }
  
  searchTerm: string = '';
  isAdding: boolean = false;
  requestEmail: string = '';
  
  friendships: FriendshipModel[] = [];

  ngOnInit(): void {
    this.loadFriends();
  }

private loadFriends(): void {
  this.friendshipService.getFriendList().subscribe({
    next: (models: FriendshipModel[]) => {
      this.friendships = models;
      this.cdr.markForCheck();
      console.log('Loaded friends:', this.friendships);
    },
    error: (err) => {
      console.error('Error loading friends:', err);
    }
  });
}

  get filteredFriends(): FriendshipModel[] {
    if (!this.searchTerm.trim()) {
      return this.friendships;
    }
    const term = this.searchTerm.toLowerCase();
    return this.friendships.filter(friendship => 
      friendship.friend.name.toLowerCase().includes(term) || 
      friendship.friend.email.toLowerCase().includes(term)
    );
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  }

  onAddFriend() {
    this.isAdding = true;
  }

  onCancel(): void {
  this.isAdding = false;
  this.requestEmail = ''; 
  }

  submitFriendRequest(): void {
  if (this.requestEmail) {
    console.log('Sending request to:', this.requestEmail);
    this.friendshipService.sendFriendRequest(this.requestEmail).subscribe({
      next: () => {
        console.log('Friend request sent successfully');
        this.onCancel();
        this.loadFriends();
      },
      error: (err) => {
        console.error('Error sending friend request:', err);
      }
    });
  }
}

goToProfile(userId: number): void {
    this.router.navigate([`/profile/${userId}`]);
  }

onAcceptFriend(friendship: any) {
  this.friendshipService.accept(friendship.friendshipId).subscribe({
        next: () => {
          this.loadFriends();
        },
        error: (err) => {
          console.error('Error removing friend:', err);
        }
      });
}

  onDeleteFriend(friendship: FriendshipModel) {
    const confirmed = confirm(`Are you sure you want to remove ${friendship.friend.name}?`);
    
    if (confirmed) {
      this.friendshipService.removeFriend(friendship.friendshipId).subscribe({
        next: () => {
          this.loadFriends();
        },
        error: (err) => {
          console.error('Error removing friend:', err);
        }
      });
    }
  }
}
