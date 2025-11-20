import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { UserModel } from '../../Models/User/user.model';

type SocialPlatform = 'Twitter' | 'LinkedIn' | 'GitHub' | 'Facebook' | 'Website';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule, HeaderComponent, FormsModule, ReactiveFormsModule],
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  form!: FormGroup;
  userData: UserModel | null = null;
  avatarPreview: string | ArrayBuffer | null = null;
  userId: number | null = null;
  defaultAvatar =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="%23222222"/><text x="50%" y="50%" font-size="36" fill="%23888888" dominant-baseline="middle" text-anchor="middle">👤</text></svg>';

  platforms: SocialPlatform[] = ['Twitter', 'LinkedIn', 'GitHub', 'Facebook', 'Website'];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(32)]],
      bio: ['', [Validators.maxLength(500)]],
      avatarFile: [null], // store file object if needed
      socials: this.fb.array([]),
    });

    // Example: populate with existing data (replace with real fetch)
    this.loadUserID();
    this.loadData(this.userId!);
  }

  get socials() {
    return this.form.get('socials') as FormArray;
  }

  addSocial(platform?: SocialPlatform, url: string = '') {
    this.socials.push(
      this.fb.group({
        platform: [platform ?? 'Twitter', Validators.required],
        url: [url, [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
      }),
    );
  }

  removeSocial(index: number) {
    this.socials.removeAt(index);
  }

  onAvatarSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // store file reference in form (if you want to upload later)
    this.form.patchValue({ avatarFile: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removeAvatar() {
    this.avatarPreview = null;
    this.form.patchValue({ avatarFile: null });
    // also clear the input if you keep a reference to it (or use template ref)
  }

  saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Extract data and send to server (replace with your service)
    const payload = {
      username: this.form.value.username,
      bio: this.form.value.bio,
      socials: this.form.value.socials,
      avatarFile: this.form.value.avatarFile, // form file, send as FormData to backend
    };

    // TODO: call your API service here. For now we just log:
    console.log('Saving profile:', payload);

    // Feedback example (replace with real UX)
    alert('Profile saved (replace with real API call)');
  }

  loadUserID() {
    this.authService.getUserID().subscribe({
      next: (userId) => {
        this.userId = userId;
        console.log('User ID loaded:', userId);
      },
      error: (err) => {
        console.error('Failed to load user ID', err);
      },
    });
  }

  private loadData(userID: number) {
    this.profileService.getUserData(userID).subscribe({
      next: (userData) => {
        this.userData = userData;
        this.form.patchValue({
          username: userData.name,
          bio: userData.bio,
        });
        console.log('User data loaded:', userData);
      },
      error: (err) => {
        console.error('Failed to load user data', err);
        this.userData = null;
      },
    });
  }
}
