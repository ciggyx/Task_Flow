import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { identifierName } from '@angular/compiler';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifierName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { identifierName, password } = this.loginForm.value;
      this.authService.login({ identifierName, password }).subscribe({
        next: () => this.router.navigate(['/home']),
        error: () => (this.errorMessage = 'Invalid credentials'),
      });
    }
  }


  get identifierName() {
    return this.loginForm.get('identifierName');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
