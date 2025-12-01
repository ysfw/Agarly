import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Home, ClipboardList, LayoutDashboard, User } from 'lucide-angular';

@Component({
  selector: 'app-navbar-logged-in',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <h1 class="text-2xl font-bold text-[#3949AB] cursor-pointer" routerLink="/home">
            Agarly
          </h1>

          <!-- Buttons -->
          <div class="flex gap-2">
            <button routerLink="/home" routerLinkActive="bg-[#3949AB] text-white"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
              <lucide-icon [img]="HomeIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Home</span>
            </button>

            <button routerLink="/requests" routerLinkActive="bg-[#3949AB] text-white"
              class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
              <lucide-icon [img]="ClipboardListIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Requests</span>
            </button>

            <button routerLink="/dashboard" routerLinkActive="bg-[#3949AB] text-white"
              class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
              <lucide-icon [img]="LayoutDashboardIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">My Items</span>
            </button>

            <!-- PROFILE BUTTON -->
            <button routerLink="/profile" routerLinkActive="bg-[#3949AB] text-white"
              class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-[#1A237E] hover:bg-gray-100">
              <lucide-icon [img]="UserIcon" class="w-5 h-5"></lucide-icon>
              <span class="hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarLoggedInComponent {
  readonly HomeIcon = Home;
  readonly ClipboardListIcon = ClipboardList;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly UserIcon = User;
}
