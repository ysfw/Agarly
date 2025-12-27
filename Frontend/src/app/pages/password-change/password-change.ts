import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Lock, Eye, EyeOff, Shield, Check, X, Loader2, AlertTriangle } from 'lucide-angular';
import { ProfileApiService, PasswordChangeRequest } from '../../services/profile-api.service';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CommonModule],
  templateUrl: './password-change.html',
  styleUrl: './password-change.css',
})
export class PasswordChange {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly ShieldIcon = Shield;
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly LoaderIcon = Loader2;
  readonly AlertIcon = AlertTriangle;

  router = inject(Router);
  private profileService = inject(ProfileApiService);

  // Form data
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  // UI states
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // Password strength
  get passwordStrength(): { level: number; text: string; color: string } {
    const password = this.newPassword;
    if (!password) return { level: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 2) return { level: 2, text: 'Fair', color: 'bg-orange-500' };
    if (strength <= 3) return { level: 3, text: 'Good', color: 'bg-yellow-500' };
    if (strength <= 4) return { level: 4, text: 'Strong', color: 'bg-green-500' };
    return { level: 5, text: 'Very Strong', color: 'bg-emerald-600' };
  }

  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword && this.confirmPassword.length > 0;
  }

  get canSubmit(): boolean {
    return (
      this.oldPassword.length > 0 &&
      this.newPassword.length >= 8 &&
      this.passwordsMatch &&
      !this.loading()
    );
  }

  // Password requirements
  get requirements() {
    return [
      { met: this.newPassword.length >= 8, text: 'At least 8 characters' },
      { met: /[a-z]/.test(this.newPassword) && /[A-Z]/.test(this.newPassword), text: 'Upper & lowercase letters' },
      { met: /\d/.test(this.newPassword), text: 'At least one number' },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword), text: 'At least one special character' },
    ];
  }

  toggleOldPassword() {
    this.showOldPassword.update(v => !v);
  }

  toggleNewPassword() {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  handleSubmit() {
    if (!this.canSubmit) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    const request: PasswordChangeRequest = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.profileService.changePassword(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        // Clear form
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        // Redirect after delay
        setTimeout(() => {
          this.router.navigate(['/settings']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.loading.set(false);
        if (err.status === 400 || err.status === 401) {
          this.error.set('Current password is incorrect. Please try again.');
        } else {
          this.error.set('Failed to change password. Please try again.');
        }
      }
    });
  }
}
