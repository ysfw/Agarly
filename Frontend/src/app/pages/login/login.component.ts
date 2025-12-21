import { Component, inject, NgZone, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly AlertCircleIcon = AlertCircle;
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

  // Google Auth state
  googleAuthError = '';
  googleAuthLoading = false;
  googleScriptLoaded = false;

  private router = inject(Router);
  private api = inject(ApiService);
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.initGoogleLoginWithRetry();
  }

  private async initGoogleLoginWithRetry(retries = 5) {
    for (let i = 0; i < retries; i++) {
      if (typeof google !== 'undefined' && google.accounts) {
        this.googleScriptLoaded = true;
        this.initGoogleLogin();
        return;
      }
      // Wait 500ms before next retry
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    // After all retries failed
    console.warn('Google Sign-In script failed to load after retries');
    this.googleAuthError = 'Google Sign-In is currently unavailable. Please use email login.';
  }

  initGoogleLogin() {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (resp: any) => this.handleCredentialResponse(resp),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const btnContainer = document.getElementById('google-button');
      if (btnContainer) {
        google.accounts.id.renderButton(
          btnContainer,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: btnContainer.clientWidth.toString(),
            shape: 'rectangular'
          }
        );
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      this.googleAuthError = 'Failed to initialize Google Sign-In. Please use email login.';
    }
  }

  handleCredentialResponse(response: any): void {
    // Clear any previous errors
    this.googleAuthError = '';

    if (response.credential) {
      this.sendTokenToBackend(response.credential);
    } else {
      this.googleAuthError = 'No credentials received from Google. Please try again.';
    }
  }

  private sendTokenToBackend(token: string): void {
    this.googleAuthLoading = true;
    this.googleAuthError = '';

    this.api.sendToken(token).subscribe({
      next: (res: any) => {
        this.googleAuthLoading = false;
        console.log('Login successful on backend', res);
        const jwtToken = res.Token || res.token || token;
        this.authService.setToken(jwtToken);
        this.ngZone.run(() => {
          this.authService.login();
          this.router.navigate(['/home']);
        });
      },
      error: (err) => {
        this.googleAuthLoading = false;
        console.error('Backend authentication failed', err);

        // Provide user-friendly error messages
        if (err.status === 0) {
          this.googleAuthError = 'Cannot connect to server. Please check your internet connection.';
        } else if (err.status === 401) {
          this.googleAuthError = 'Authentication failed. Please try again.';
        } else if (err.status === 403) {
          this.googleAuthError = 'Access denied. Your account may be restricted.';
        } else {
          this.googleAuthError = 'Google sign-in failed. Please try again or use email login.';
        }
      }
    });
  }

  // reactive validation
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

    this.api.loginUser(this.formData).subscribe({
      next: (res: any) => {
        const token = res.Token;
        this.authService.setToken(token);
        this.loading = false;
        this.authService.login();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        const statusCode = err?.status;
        if (statusCode === 403) {
          this.backendError = 'Your account has been banned. Please contact support for assistance.';
        } else {
          this.backendError = 'Invalid email or password';
        }
      },
    });
  }
}
