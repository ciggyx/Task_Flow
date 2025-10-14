import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';

type SocialPlatform = 'Twitter' | 'LinkedIn' | 'GitHub' | 'Facebook' | 'Website';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule, HeaderComponent, FormsModule, ReactiveFormsModule],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  form!: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="%23222222"/><text x="50%" y="50%" font-size="36" fill="%23888888" dominant-baseline="middle" text-anchor="middle">👤</text></svg>';

  platforms: SocialPlatform[] = ['Twitter', 'LinkedIn', 'GitHub', 'Facebook', 'Website'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(32)]],
      bio: ['', [Validators.maxLength(500)]],
      avatarFile: [null], // store file object if needed
      socials: this.fb.array([])
    });

    // Example: populate with existing data (replace with real fetch)
    this.loadMockProfile();
  }

  get socials() {
    return this.form.get('socials') as FormArray;
  }

  addSocial(platform?: SocialPlatform, url: string = '') {
    this.socials.push(
      this.fb.group({
        platform: [platform ?? 'Twitter', Validators.required],
        url: [url, [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]]
      })
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
      avatarFile: this.form.value.avatarFile // form file, send as FormData to backend
    };

    // TODO: call your API service here. For now we just log:
    console.log('Saving profile:', payload);

    // Feedback example (replace with real UX)
    alert('Profile saved (replace with real API call)');
  }

  private loadMockProfile() {
    // Mock existing profile data — replace with real HTTP fetch on init
    const mock = {
      username: 'ulises381',
      bio: '',
      avatarUrl: null,
      socials: [
        { platform: 'Twitter', url: 'https://twitter.com/example' },
        { platform: 'GitHub', url: 'https://github.com/example' }
      ]
    };

    this.form.patchValue({
      username: mock.username,
      bio: mock.bio
    });

    if (mock.avatarUrl) {
      this.avatarPreview = mock.avatarUrl;
    } else {
      this.avatarPreview = this.defaultAvatar;
    }

    // populate socials
    (mock.socials || []).forEach(s => this.addSocial(s.platform as SocialPlatform, s.url));
  }
}
