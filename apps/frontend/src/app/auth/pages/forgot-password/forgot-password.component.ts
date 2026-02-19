import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-forgot-password',
  standalone: true, // <--- REVISA QUE ESTO ESTÉ AQUÍ
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})

export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  errorMessage: string | null = null;
  successMessage = '';
  loading = false; // Nueva variable para el estado de carga

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    const { email } = this.forgotForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = "Email sent successfully!";
        
        // 3. Forzar a Angular a revisar la vista INMEDIATAMENTE
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'An error occurred while processing the request.';
        
        // También aquí por si el error no se muestra
        this.cdr.detectChanges(); 
        console.error(err);
      },
    });
  }
}