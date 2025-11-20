import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  // Validamos que las contraseñas coincidan
  passwordsMatch(): boolean {
    const pass = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return pass === confirm;
  }

  // Manejamos el submit
  onSubmit(): void {
    this.successMessage = null; // Reset success message
    this.errorMessage = null; // Reset error message

    if (this.registerForm.valid && this.passwordsMatch()) {
      const { name, email, password } = this.registerForm.value;

      this.authService.register({ name, email, password }).subscribe({
        next: () => {
          this.successMessage = 'Usuario registrado correctamente';
          this.cd.detectChanges();
          setTimeout(() => this.router.navigate(['/auth/login']), 2000); // espera 2 segundos
        },

        error: (err) => {
          this.errorMessage = 'Algo salió mal. Por favor, intentá nuevamente.';
          console.error(err);
          this.cd.detectChanges();
        },
      });
    } else {
      this.errorMessage = 'Verificá los campos e intentá nuevamente.';
    }
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
