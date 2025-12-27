import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-angular';
import { NotificationService, NotificationToast } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of toasts; track toast.id) {
        <div class="pointer-events-auto animate-slideIn min-w-[320px] max-w-[420px] rounded-xl shadow-lg border backdrop-blur-sm p-4"
          [ngClass]="{
            'bg-emerald-50/95 border-emerald-200 text-emerald-800': toast.type === 'success',
            'bg-blue-50/95 border-blue-200 text-blue-800': toast.type === 'info',
            'bg-amber-50/95 border-amber-200 text-amber-800': toast.type === 'warning',
            'bg-red-50/95 border-red-200 text-red-800': toast.type === 'error'
          }">
          <div class="flex items-start gap-3">
            <div class="shrink-0 mt-0.5">
              @switch (toast.type) {
                @case ('success') {
                  <lucide-icon [img]="CheckCircleIcon" class="w-5 h-5 text-emerald-600"></lucide-icon>
                }
                @case ('info') {
                  <lucide-icon [img]="InfoIcon" class="w-5 h-5 text-blue-600"></lucide-icon>
                }
                @case ('warning') {
                  <lucide-icon [img]="AlertTriangleIcon" class="w-5 h-5 text-amber-600"></lucide-icon>
                }
                @case ('error') {
                  <lucide-icon [img]="AlertCircleIcon" class="w-5 h-5 text-red-600"></lucide-icon>
                }
              }
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm">{{ toast.title }}</p>
              <p class="text-sm opacity-90 mt-0.5">{{ toast.message }}</p>
            </div>
            <button (click)="dismissToast(toast.id)" 
              class="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <lucide-icon [img]="XIcon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly InfoIcon = Info;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XIcon = X;

  private notificationService = inject(NotificationService);
  private subscription?: Subscription;

  toasts: NotificationToast[] = [];

  ngOnInit() {
    this.subscription = this.notificationService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
            // Auto-dismiss after 5 seconds
      setTimeout(() => {
        this.dismissToast(toast.id);
      }, 5000);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  dismissToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
