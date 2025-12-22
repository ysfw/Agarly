import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Home, ClipboardList, LayoutDashboard, User } from 'lucide-angular';
import { EventService } from '../../services/event-service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Subscription } from 'rxjs';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-navbar-logged-in',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <img src="assets/agarlyblu.png" alt="Agarly" routerLink="/home" class="h-10 cursor-pointer">


          <!-- Buttons -->
          <div class="flex gap-2">
            <a routerLink="/home" routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all">
              <lucide-icon [img]="HomeIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Home</span>
            </a>

            <a routerLink="/requests" routerLinkActive="active-link"
              class="nav-link flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all">
              <lucide-icon [img]="ClipboardListIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Requests</span>
            </a>

            <a routerLink="/dashboard" routerLinkActive="active-link"
              class="nav-link flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all">
              <lucide-icon [img]="LayoutDashboardIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Dashboard</span>
            </a>

            <!-- PROFILE BUTTON -->
            <a routerLink="/profile" routerLinkActive="active-link"
              class="nav-link flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all">
              <lucide-icon [img]="UserIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Profile</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host ::ng-deep .nav-link {
      color: #1A237E;
      background-color: transparent;
    }
    
    :host ::ng-deep .nav-link:hover:not(.active-link) {
      background-color: #E8EAF6;
    }
    
    :host ::ng-deep .active-link {
      background-color: #3949AB !important;
      color: white !important;
    }
    
    :host ::ng-deep .active-link:hover {
      background-color: #303F9F !important;
    }
  `]
})
export class NavbarLoggedInComponent implements OnInit, OnDestroy {
  readonly HomeIcon = Home;
  readonly ClipboardListIcon = ClipboardList;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly UserIcon = User;
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  public modalService = inject(ModalService);
  private sseSubscription?: Subscription;

  ngOnInit() {
    // SSE is now initialized by AuthService on login
    // Just subscribe to events to handle them
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
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
  modalState$ = this.modalService.modalState$;

  ngOnDestroy() {
    // Only unsubscribe from the event subscription, don't stop SSE
    // SSE is managed by AuthService and should stay open while logged in
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }
}
