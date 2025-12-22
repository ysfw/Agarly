import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventService } from './services/event-service';
import { AuthService } from './services/auth.service';
import { AdminService } from './services/admin.service';
import { ModalService } from './services/modal.service';
import { AlertModalComponent } from './components/alert-modal/alert-modal.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, AlertModalComponent, CommonModule],
  template: `
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
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-project';

  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  public modalService = inject(ModalService);
  private sseSubscription?: Subscription;

  modalState$ = this.modalService.modalState$;

  ngOnInit() {
    // Only start SSE if user OR admin is authenticated
    if (this.authService.isAuthenticated() || this.adminService.isAuthenticated()) {
      console.log('User/Admin authenticated - Starting SSE connection');
      this.startSSE();
    } else {
      console.log('No authentication found - Skipping SSE connection');
    }
  }

  private startSSE() {
    this.sseSubscription = this.eventService.getEvents().subscribe({
      next: (event) => {
        console.log('SSE Event received:', event);

        // Handle Banned event
        if (event.type === 'Banned') {
          console.log('Banned event received, checking current user...');
          console.log('Banned users list:', event.to);

          // Try to get username from various localStorage sources
          let username: string | null = null;

          // Check currentUser
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            try {
              const userData = JSON.parse(currentUser);
              username = userData.username;
              console.log('Username from currentUser:', username);
            } catch (e) {
              console.error('Error parsing currentUser:', e);
            }
          }

          // If not found, check if there's a username stored directly
          if (!username) {
            username = localStorage.getItem('username');
            console.log('Username from username key:', username);
          }

          // If still not found, try to decode from token
          if (!username) {
            const token = this.authService.getToken();
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                username = payload.sub || payload.username;
                console.log('Username from token:', username);
              } catch (e) {
                console.error('Error decoding token:', e);
              }
            }
          }

          console.log('Final username:', username);

          // Check if current user is in the banned list
          if (username && event.to && event.to.includes(username)) {
            console.warn('Current user is banned! Logging out...');
            this.modalService.alert(
              'Your account has been banned by an administrator. You will be logged out.',
              'Account Banned'
            ).then(() => {
              this.authService.logout();
            });
          } else {
            console.log('Current user is not in banned list or username not found');
          }
        }
      },
      error: (err) => {
        console.error('SSE Error:', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    this.eventService.stopEvents();
  }
}
