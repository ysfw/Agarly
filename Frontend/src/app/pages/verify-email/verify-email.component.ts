import { Component, signal, computed, effect, ViewChildren, QueryList, AfterViewInit, ElementRef, inject, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Mail, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-angular';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { UserDTO } from 'src/app/models/user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: 'verify-email.component.html'
})
export class VerifyEmailComponent implements AfterViewInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  readonly MailIcon = Mail;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckIcon = Check;
  readonly AlertIcon = AlertCircle;
  readonly LoaderIcon = Loader2;
  private ngZone = inject(NgZone)
  private apiService = inject(ApiService)
  private router = inject(Router);
  private authService = inject(AuthService);

  email = signal<string>(this.authService.email());
  userData = signal<UserDTO>(this.authService.userData())

  // Signals
  otpDigits = signal(['', '', '', '', '', '']);

  countdown = signal(60);
  successMessage = signal('');
  errorMessage = signal('');
  isResending = signal(false);

  // Computed signals
  isOtpComplete = computed(() => {
    return this.otpDigits().every(digit => digit !== '');
  });

  isResendAvailable = computed(() => {
    return this.countdown() === 0 && !this.isResending();
  });

  private countdownInterval: any = null;

  constructor() {
    // Start countdown timer on initialization
    effect(() => {
      if (this.countdown() > 0) {
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        this.countdownInterval = setInterval(() => {
          this.countdown.update(count => (count > 0 ? count - 1 : 0));
        }, 1000);
      } else if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    });
  }

  ngAfterViewInit(): void {
    // Focus on first input after view init
    if (this.otpInputs && this.otpInputs.length > 0) {
      this.otpInputs.first.nativeElement.focus();
    }
  }

  handleOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Only allow numeric input
    if (!/^\d*$/.test(value)) {
      value = value.replace(/[^\d]/g, '');
    }

    // Keep only last digit if multiple were entered
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Update the signal
    const digits = [...this.otpDigits()];
    digits[index] = value;
    this.otpDigits.set(digits);

    // Update the input value (for visual sync)
    input.value = value;

    // Auto-focus next input if value entered
    if (value !== '' && index < 5) {
      setTimeout(() => {
        if (this.otpInputs) {
          this.otpInputs.toArray()[index + 1]?.nativeElement.focus();
        }
      }, 0);
    }
  }

  handleKeyDown(index: number, event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const digits = [...this.otpDigits()];

    // Handle backspace
    if (event.key === 'Backspace') {
      event.preventDefault(); // Prevent default to have full control

      if (digits[index] !== '') {
        // Clear current input
        digits[index] = '';
        this.otpDigits.set(digits);
        input.value = '';
      } else if (index > 0) {
        // Move to previous input and clear it
        const prevInput = this.otpInputs.toArray()[index - 1]?.nativeElement;
        if (prevInput) {
          digits[index - 1] = '';
          this.otpDigits.set(digits);
          prevInput.value = '';
          prevInput.focus();
        }
      }
      return;
    }

    // Handle arrow keys for navigation
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      if (this.otpInputs) {
        this.otpInputs.toArray()[index - 1]?.nativeElement.focus();
      }
    }

    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      if (this.otpInputs) {
        this.otpInputs.toArray()[index + 1]?.nativeElement.focus();
      }
    }
  }

  // Handle paste event for OTP
  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';

    // Extract only digits from pasted content
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length > 0) {
      // Fill the OTP inputs with pasted digits
      const newOtpDigits = ['', '', '', '', '', ''];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtpDigits[index] = digit;
        }
      });

      this.otpDigits.set(newOtpDigits);

      // Update all input fields visually
      setTimeout(() => {
        this.otpInputs.toArray().forEach((inputRef, index) => {
          inputRef.nativeElement.value = newOtpDigits[index];
        });

        // Focus on the last filled input or the next empty one
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        const nextIndex = digits.length < 6 ? digits.length : 5;
        this.otpInputs.toArray()[nextIndex]?.nativeElement.focus();
      }, 0);
    }
  }

  verifyEmail(): void {
    if (!this.isOtpComplete()) return;

    this.successMessage.set('');
    this.errorMessage.set('');

    const code = this.otpDigits().join('');
    console.log('Verifying code:', code);

    this.apiService.sendOTP(this.email(), code).subscribe({
      next: (response: any) => {
        console.log(response)
        const message = response?.status || response?.message || 'Email verified successfully!';
        this.successMessage.set(message);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        const errorMsg = err.error?.status || err.error?.message || err.error || 'Verification failed. Please try again.';
        this.errorMessage.set(errorMsg);
      }
    })
  }

  resendCode(): void {
    if (!this.isResendAvailable()) return;

    this.isResending.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.apiService.resendOTP(this.email()).subscribe({
      next: (response: any) => {
        console.log("OTP resent successfully:", response);
        const message = response?.status || response?.message || 'OTP sent successfully!';
        this.successMessage.set(message);

        // Reset OTP inputs
        this.otpDigits.set(['', '', '', '', '', '']);

        // Clear input fields visually
        setTimeout(() => {
          this.otpInputs.toArray().forEach(inputRef => {
            inputRef.nativeElement.value = '';
          });
          // Focus first input
          this.otpInputs.first?.nativeElement.focus();
        }, 0);

        // Reset countdown
        this.countdown.set(60);
        this.isResending.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Resend OTP failed:', err);
        const errorMsg = err.error?.status || err.error?.message || err.error || 'Failed to resend OTP. Please try again.';
        this.errorMessage.set(errorMsg);
        this.isResending.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/register']);
  }

  skipVerification(): void {
    // Navigate to login, user can verify later from their profile
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    // Clean up interval on component destroy
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
