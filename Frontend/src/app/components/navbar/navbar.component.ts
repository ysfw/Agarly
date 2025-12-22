import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Home, ClipboardList, LayoutDashboard, User, LogIn } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-16">
          <img src="assets/agarlyblu.png" alt="Agarly" class="h-10 cursor-pointer" (click)="navigate('/home')">

          <div class="flex gap-2">
            <button (click)="navigate('/home')" class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
              <lucide-icon [img]="HomeIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Home</span>
            </button>
            <button (click)="navigate('/requests')" class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
              <lucide-icon [img]="ClipboardListIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Requests</span>
            </button>
            <button (click)="navigate('/dashboard')" class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
              <lucide-icon [img]="LayoutDashboardIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">My Items</span>
            </button>
            @if (authService.isLoggedIn()) {
              <button (click)="navigate('/profile')" class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
                <lucide-icon [img]="UserIcon" class="w-5 h-5"></lucide-icon>
                <span class="hidden sm:inline">Profile</span>
              </button>
            } @else {
              <button (click)="navigate('/login')" class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
                <lucide-icon [img]="LogInIcon" class="w-5 h-5"></lucide-icon>
                <span class="hidden sm:inline">Login</span>
              </button>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {      // logged out navbar
  authService = inject(AuthService);
  router = inject(Router);

  readonly HomeIcon = Home;
  readonly ClipboardListIcon = ClipboardList;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly UserIcon = User;
  readonly LogInIcon = LogIn;

  navigate(path: string) {
    if (!this.authService.isLoggedIn() && path !== '/login') {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate([path]);
    }
  }
}
