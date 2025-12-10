import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-restore-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './restore-password.component.html',
  styleUrls: ['./restore-password.component.css'],
})
export class RestorePasswordComponent implements OnInit {
  restoreForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    this.restoreForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]], // Email is now editable
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  ngOnInit(): void {
    // Optionally prefill email from query parameters
    this.route.queryParamMap.subscribe((params) => {
      const email = params.get('email');
      if (email) {
        this.restoreForm.patchValue({ email });
      }
    });
  }

  // Password match validator
  passwordsMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.restoreForm.valid) {
      const { email, password } = this.restoreForm.value;

      this.authService.restorePassword(email, password).subscribe({
        next: () => {
          this.successMessage = 'Contraseña actualizada correctamente.';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Algo salió mal. No se pudo actualizar la contraseña.';
        },
      });
    } else {
      if (this.restoreForm.get('email')?.errors?.['required']) {
        this.errorMessage = 'El correo electrónico es obligatorio.';
      } else if (this.restoreForm.get('email')?.errors?.['email']) {
        this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      } else if (this.restoreForm.get('password')?.errors?.['minlength']) {
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (this.restoreForm.errors?.['mismatch']) {
        this.errorMessage = 'Las contraseñas no coinciden.';
      } else {
        this.errorMessage = 'Por favor, completa el formulario correctamente.';
      }
    }
  }

  get email() {
    return this.restoreForm.get('email');
  }

  get password() {
    return this.restoreForm.get('password');
  }

  get confirmPassword() {
    return this.restoreForm.get('confirmPassword');
  }
}
