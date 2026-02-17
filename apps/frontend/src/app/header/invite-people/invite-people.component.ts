import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FriendshipService } from '../../services/friendship.service';
import { FriendshipDTO, FriendshipModel } from '../../Models/Friendship/friendship.model';

@Component({
  selector: 'app-invite-people',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './invite-people.component.html',
  styleUrls: ['./invite-people.component.css']
})
export class InviteModalComponent implements OnInit { // Implemented OnInit
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() inviteUser = new EventEmitter<string>();

  email: string = '';
  friendSearchTerm: string = '';
  isLoading: boolean = false;
  friendships: FriendshipModel[] = [];

  constructor(private friendshipService: FriendshipService) { }

  ngOnInit(): void {
    this.loadFriends();
  }

  private loadFriends(): void {
    this.friendshipService.getFriendList().subscribe({
      next: (dtos: FriendshipDTO[]) => {
        this.friendships = dtos.map(dto => FriendshipModel.fromDTO(dto));
        console.log('Loaded friends:', this.friendships);
      },
      error: (err) => {
        console.error('Error loading friends:', err);
      }
    });
  }

  onClose() {
    this.email = ''; 
    this.close.emit();
  }

  selectFriend(email: string) {
    this.email = email;
  }

  get filteredFriends() {
    if (!this.friendSearchTerm) return this.friendships;
    return this.friendships.filter(f => 
      f.friend.name.toLowerCase().includes(this.friendSearchTerm.toLowerCase()) || 
      f.friend.email.toLowerCase().includes(this.friendSearchTerm.toLowerCase())
    );
  }

  onSubmit() {
    if (this.email && this.isValidEmail(this.email)) {
      this.isLoading = true;
      
      this.inviteUser.emit(this.email);
      
      setTimeout(() => {
        this.isLoading = false;
        this.email = '';
        this.onClose();
      }, 500);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}