import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModel } from '../../../Models/User/user.model';
import { participantTypeModel } from '../../../Models/ParticipantType/participantType.model';

@Component({
  selector: 'app-member-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-sidebar.html',
  styleUrls: ['./member-sidebar.css']
})
export class MemberSidebarComponent {
  @Input() members: UserModel[] = [];
  @Input() roles: participantTypeModel[] = [];
  @Input() isVisible: boolean = false; 
  
  @Output() close = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() changePermission = new EventEmitter<{id: number, roleId: number}>();
}