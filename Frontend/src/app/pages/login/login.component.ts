import { Component, inject, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff } from 'lucide-angular';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

declare var google: any; // Declare google object from the loaded script

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {
    // Initialize the Google Identity Services client
    google.accounts.id.initialize({
      client_id: '665603013636-4q5rdlns1vsn254j42a2fqkg9p7nrc7p.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this) // Bind the Angular component context
    });

    // Render the Google Sign-In button
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
  }

  // This function is called by the Google library when a token is received
  handleCredentialResponse(response: any): void {
    if (response.credential) {
      // Send the ID token to the Spring Boot backend
      this.sendTokenToBackend(response.credential);
    }
  }

  private sendTokenToBackend(token: string): void {

    console.log(token)

    this.api.sendToken(token).subscribe({
      next: (res: any) => {
        console.log('Login successful on backend', res);
        // Store your application's session/JWT token (if returned)
        localStorage.setItem('app_session_token', res.appToken);
        // Redirect the user
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Backend authentication failed', err);
        // Handle error: show a notification to the user
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

  // handleSubmit() {
  //   if (!this.validateForm()) return;

  //   this.loading = true;
  //   this.backendError = '';

  //   // Backend call 
  //   this.api.loginUser(this.formData).subscribe({
  //     next: () => {
  //       this.loading = false;
  //       this.authService.login();
  //       this.router.navigate(['/home']);
  //     },
  //     error: (err) => {
  //       this.loading = false;
  //       this.backendError = err?.message || 'Invalid email or password';
  //     },
  //   });
  // }

  // goToForgot() {
  //   this.router.navigate(['/forgot-password']);
  // }

  handleSubmit() {      // placeholder for testing front
    if (!this.validateForm()) return;
    this.authService.login();
    this.router.navigate(['/home']);
  }
}
