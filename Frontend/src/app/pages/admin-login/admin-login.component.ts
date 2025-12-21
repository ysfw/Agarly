import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, Shield, Loader2 } from 'lucide-angular';
import { AdminService } from '../../services/admin.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  readonly ShieldIcon = Shield;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly LoaderIcon = Loader2;

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
  private adminService = inject(AdminService);

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

    // Use AdminService for admin authentication
    this.adminService.login(this.formData).subscribe({
      next: (res) => {
        console.log("Admin login successful");
        this.loading = false;
        // Navigate to admin dashboard
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Admin login failed, Status Code:', err.status);
        this.loading = false;
        this.backendError = 'Invalid email or password';
      },
    });
  }
}

