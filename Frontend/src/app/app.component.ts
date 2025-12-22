import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventService } from './services/event-service';
import { AuthService } from './services/auth.service';
import { AdminService } from './services/admin.service';
import { ModalService } from './services/modal.service';
import { AlertModalComponent } from './components/alert-modal/alert-modal.component';
import { VerificationBannerComponent } from './components/verification-banner/verification-banner.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, AlertModalComponent, CommonModule, VerificationBannerComponent],
  template: `
    <app-verification-banner></app-verification-banner>
    <router-outlet></router-outlet>

    <!-- Global Modal -->
    @if (modalState$ | async; as modalState) {
      <app-alert-modal
        [isOpen]="modalState.isOpen"
        [title]="modalState.config.title"
        [message]="modalState.config.message"
        [confirmText]="modalState.config.confirmText || 'OK'"
        [cancelText]="modalState.config.cancelText || 'Cancel'"
        [showCancel]="modalState.config.showCancel || false"
        (confirm)="modalService.handleConfirm()"
        (cancel)="modalService.handleCancel()"
        (close)="modalService.close()"
      ></app-alert-modal>
    }
  `,
})
export class AppComponent implements OnDestroy {
  title = 'angular-project';

  private eventService = inject(EventService);
  public modalService = inject(ModalService);
  private sseSubscription?: Subscription;

  modalState$ = this.modalService.modalState$;

  ngOnDestroy() {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    this.eventService.stopEvents();
  }
}
