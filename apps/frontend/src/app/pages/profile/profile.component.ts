import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { delay, Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../services/profile.service';
import { FriendshipService } from '../../services/friendship.service';
import { UserModel } from '../../Models/User/user.model';
import { HeaderComponent } from '../../header/header.component';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule, ReactiveFormsModule],
})
export class ProfileComponent implements OnInit, OnDestroy {
  form: FormGroup; 
  userData: UserModel | null = null;
  avatarPreview: string | ArrayBuffer | null = 'assets/default-avatar.png'; 
  userId: number | null = null;
  isOwner: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder, 
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private friendshipService: FriendshipService,
    private location: Location,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
  this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((pm: ParamMap) => {
    const id = pm.get('id');
    if (id) {
      this.userId = Number(id);
      // We check ownership immediately so the UI boolean 'isOwner' updates fast
      this.updateOwnershipStatus(); 
      this.loadData(this.userId);
    }
  });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

private loadData(userID: number) {
  this.profileService.getUserData(userID).subscribe({
    next: (userData) => {
      this.userData = userData;
      this.form.patchValue({
        name: userData.name,
        description: userData.description,
      });

      if (this.isOwner) {
        this.form.enable();
      } else {
        this.form.disable();
      }
      
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Failed to load user data', err);
    },
  });
}

  saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = { ...this.form.value };
    this.profileService.updateProfile(this.userId!, payload).subscribe({
      next: (updatedUser) => {
        this.userData = updatedUser;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update user data', err);
      },
    });
  }

  private updateOwnershipStatus() {
  const user = this.authService.currentUserValue;
  this.isOwner = user ? user.sub === this.userId : false;
  }

  blockUser(): void {
    if (!this.userData) return;
    this.friendshipService.blockUser(this.userData.email).subscribe({
      next: () => {
        delay(500);
        this.location.back();
      },
      error: (err) => {
        console.error('Failed to block user', err);
      },
    });
  }

  get userInitials(): string {
    if (!this.userData?.name) return '?';
    
    const names = this.userData.name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase().substring(0, 2); 
  }

}