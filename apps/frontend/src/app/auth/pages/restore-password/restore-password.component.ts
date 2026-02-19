import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Añadido ChangeDetectorRef
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

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
  loading = false; // Estado de carga para el botón

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // Inyectamos el detector de cambios
  ) {
    this.restoreForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const email = params.get('email');
      if (email) {
        this.restoreForm.patchValue({ email });
        this.cdr.detectChanges(); // Asegura que el valor se vea en el input
      }
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
  if (this.restoreForm.invalid) {
    this.setErrorMessage();
    return;
  }

  this.loading = true; // El botón muestra el spinner
  this.errorMessage = null;
  
  const { email, password } = this.restoreForm.value;

  this.authService.restorePassword(email, password).subscribe({
    next: () => {
      this.successMessage = 'Password updated!';
      this.cdr.detectChanges();
      
      // Delay corto de 1.5s para que vea el "Check" verde y redirigir
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 1500); 
    },
    error: (err) => {
      this.loading = false;
      this.errorMessage = 'Could not update password. Please try again.';
      this.cdr.detectChanges();
    }
  });
}

  // Helper para centralizar los mensajes de error en inglés
  private setErrorMessage(): void {
    const emailErrors = this.restoreForm.get('email')?.errors;
    const passErrors = this.restoreForm.get('password')?.errors;

    if (emailErrors?.['required']) this.errorMessage = 'Email is required.';
    else if (emailErrors?.['email']) this.errorMessage = 'Please enter a valid email.';
    else if (passErrors?.['minlength']) this.errorMessage = 'Password must be at least 6 characters.';
    else if (this.restoreForm.errors?.['mismatch']) this.errorMessage = 'Passwords do not match.';
    else this.errorMessage = 'Please complete the form correctly.';
  }
}