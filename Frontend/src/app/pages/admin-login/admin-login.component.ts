import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-angular';
import { ApiService } from '../../services/api.service';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, NgIf],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  readonly ShieldIcon = Shield;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  formData = {
    email: '',
    password: '',
  };

  errors = {
    email: '',
    password: '',
  };

  loading = false;
  backendError = '';
  private router = inject(Router);
  private api = inject(ApiService);
  private authService = inject(AuthService);

  ngOnChange(field: string) {
    this.validateField(field);
  }

  validateField(field: string) {
    switch (field) {
      case 'email':
        const email = this.formData.email.trim();
        if (!email) this.errors.email = 'Email is required';
        else if (!/^[A-Za-z0-9.]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))
          this.errors.email = 'Invalid email format';
        else this.errors.email = '';
        break;

      case 'password':
        const password = this.formData.password;
        if (!password) this.errors.password = 'Password is required';
        else if (password.length < 3)
          this.errors.password = 'Password cannot be too short';
        else this.errors.password = '';
        break;
    }
  }

  validateForm() {
    ['email', 'password'].forEach((f) => this.validateField(f));
    return Object.values(this.errors).every((e) => e === '');
  }

  handleSubmit() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.backendError = '';

    // Backend call 
    this.api.loginAdmin(this.formData).subscribe({
      next: () => {
        this.loading = false;
        this.authService.login();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.backendError = err?.message || 'Invalid email or password';
      },
    });
  }
}
