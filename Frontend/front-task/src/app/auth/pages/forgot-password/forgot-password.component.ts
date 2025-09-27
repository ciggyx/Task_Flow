import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
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
  
  // Nuevas variables de estado
  emailSent = false;
  resetUrl: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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
        console.log('Solicitud exitosa', res);
        // 3. Navegá programáticamente aquí
        this.router.navigate(['/auth/restore-password']);
      },
      error: (err) => {
        this.errorMessage = 'Ocurrió un error al procesar la solicitud.';
        console.error(err);
      },
    });
  }
}