import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  errorMessage: string | null = null;
  successMessage = '';

  // Nuevas variables de estado
  emailSent = false;
  resetUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }
    const { email } = this.forgotForm.value;
    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.successMessage = "The message has been sent successfully. If you don't find the email, please check your spam folder."
        // Después de tres segundos se oculta el mensaje
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while processing the request.';
        console.error(err);
      },
    });
  }
}
