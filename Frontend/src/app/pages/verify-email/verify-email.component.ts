import { Component, signal, computed, effect, ViewChildren, QueryList, AfterViewInit, ElementRef, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Mail, ArrowLeft } from 'lucide-angular';
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

  // Computed signals
  isOtpComplete = computed(() => {
    return this.otpDigits().every(digit => digit !== '');
  });

  isResendAvailable = computed(() => {
    return this.countdown() === 0;
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

    // Keep only last digit if multiple were pasted
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Update the signal
    const digits = this.otpDigits();
    digits[index] = value;
    this.otpDigits.set([...digits]);

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
    // Handle backspace
    if (event.key === 'Backspace') {
      const digits = this.otpDigits();
      
      if (digits[index] === '') {
        // Move to previous input if current is empty
        if (index > 0) {
          event.preventDefault();
          if (this.otpInputs) {
            this.otpInputs.toArray()[index - 1]?.nativeElement.focus();
          }
        }
      } else {
        // Clear current input
        digits[index] = '';
        this.otpDigits.set([...digits]);
      }
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

  verifyEmail(): void {
    if (!this.isOtpComplete()) return;
    
    this.successMessage.set('');
    this.errorMessage.set('');

    const code = this.otpDigits().join('');
    console.log('Verifying code:', code);
    // TODO: Call API to verify the code
    this.apiService.sendOTP(this.email(), code).subscribe({
      next: (response : any) => {
        this.successMessage.set(typeof response === 'string' ? response : 'Email verified successfully!');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err : "OTP Expired!" | "Incorrect OTP!") => {
        this.errorMessage.set(err || 'Verification failed. Please try again.');
      }
    })
  }

  resendCode(): void {
    this.apiService.registerUser(this.userData()).subscribe({
      next : (response : any) => {
        console.log("Response from backend: ", response)
      },
      error : (err : HttpErrorResponse) => {
        console.error('An error occurred, Status Code:', err.status)
        console.error('Error body:', err.error)
      }
    })

    // Reset OTP inputs
    this.otpDigits.set(['', '', '', '', '', '']);
    
    // Reset countdown
    this.countdown.set(60);
    
    // Focus first input
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.length > 0) {
        this.otpInputs.first.nativeElement.focus();
      }
    }, 0);
    
    console.log('Resending code to:', this.authService.email());
    // TODO: Call API to resend the code
  }

  goBack(): void {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    // Clean up interval on component destroy
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
