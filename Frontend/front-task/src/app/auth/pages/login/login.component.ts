import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.group({
      identifierName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.errorMessage = null; // Resetear mensaje de error antes de validar
    this.successMessage = null; // Resetear mensaje de éxito

    if (this.loginForm.valid) {
      const { identifierName, password } = this.loginForm.value;

      this.authService.login({ identifierName, password }).subscribe({
        next: () => {
          this.errorMessage = null;
          this.successMessage = 'Login successful! Redirecting...';
          this.cd.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
        error: () => {
          this.successMessage = null;
          this.errorMessage = 'Invalid credentials';
          this.cd.detectChanges(); // Forzar actualización inmediata
        },
      });
    } else {
      this.errorMessage = 'Please fill in all required fields.';
      this.cd.detectChanges();
    }
  }

  get identifierName() {
    return this.loginForm.get('identifierName');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
