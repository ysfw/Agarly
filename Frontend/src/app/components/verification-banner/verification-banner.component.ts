import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Mail, X } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-verification-banner',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    @if (authService.isLoggedIn() && !authService.isVerified() && !isDismissed) {
      <div class="bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-white px-6 py-3 shadow-md">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 flex-1">
            <lucide-icon [img]="MailIcon" class="w-5 h-5 flex-shrink-0"></lucide-icon>
            <div class="flex-1">
              <p class="font-semibold text-sm">Email Not Verified</p>
              <p class="text-xs opacity-90">Please verify your email to access all features</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              (click)="verifyNow()"
              class="px-4 py-2 bg-white text-[#FF8F00] rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
              Verify Now
            </button>
            <button 
              (click)="dismiss()"
              class="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <lucide-icon [img]="XIcon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: []
})
export class VerificationBannerComponent {
    readonly MailIcon = Mail;
    readonly XIcon = X;

    authService = inject(AuthService);
    router = inject(Router);

    isDismissed = false;

    verifyNow(): void {
        this.router.navigate(['/verify-email']);
    }

    dismiss(): void {
        this.isDismissed = true;
    }
}
