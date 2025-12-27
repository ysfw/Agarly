import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Home, Grid3x3, User, Plus, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Mobile Header -->
    <div class="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between z-50">
      <h2 style="color: #1A237E">Agarly</h2>
      <button (click)="toggleMobileMenu()" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
        @if (mobileMenuOpen) {
          <lucide-icon [img]="XIcon" class="w-6 h-6 text-slate-700"></lucide-icon>
        } @else {
          <lucide-icon [img]="MenuIcon" class="w-6 h-6 text-slate-700"></lucide-icon>
        }
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    @if (mobileMenuOpen) {
      <div class="lg:hidden fixed inset-0 bg-black/50 z-40" (click)="mobileMenuOpen = false"></div>
    }

    <!-- Sidebar -->
    <aside class="fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 z-40 transition-transform duration-300 w-64 flex flex-col"
           [ngClass]="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
      <!-- Logo -->
      <div class="p-6 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" style="background-color: #C5CAE9">
            <svg class="w-6 h-6" style="color: #3949AB" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 style="color: #1A237E">Agarly</h2>
        </div>
      </div>

      <!-- Add Item Button -->
      <div class="p-4">
        <button (click)="handleAddItem()" 
                class="w-full text-white rounded-xl h-12 flex items-center justify-center gap-2 transition-colors"
                style="background-color: #3949AB"
                (mouseenter)="hovered = true" 
                (mouseleave)="hovered = false"
                [style.background-color]="hovered ? '#303F9F' : '#3949AB'">
          <lucide-icon [img]="PlusIcon" class="w-5 h-5"></lucide-icon>
          Add Item
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 space-y-2">
        @for (item of navItems; track item.id) {
          <button (click)="handleTabChange(item.id)"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  [ngClass]="activeTab === item.id ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-700 hover:bg-slate-50'"
                  [style.background-color]="activeTab === item.id ? '#E8EAF6' : ''"
                  [style.color]="activeTab === item.id ? '#1A237E' : ''">
            <lucide-icon [img]="item.icon" class="w-5 h-5" [style.color]="activeTab === item.id ? '#3949AB' : ''"></lucide-icon>
            <span>{{ item.label }}</span>
          </button>
        }
      </nav>

      <!-- User Info -->
      <div class="p-4 border-t border-slate-200">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: #3949AB">
            JD
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-slate-900 text-sm truncate">John Doe</p>
            <p class="text-slate-500 text-xs">View profile</p>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() activeTab: string = 'home';
  @Output() tabChange = new EventEmitter<string>();
  @Output() addItem = new EventEmitter<void>();

  mobileMenuOpen = false;
  hovered = false;

  readonly HomeIcon = Home;
  readonly Grid3x3Icon = Grid3x3;
  readonly UserIcon = User;
  readonly PlusIcon = Plus;
  readonly MenuIcon = Menu;
  readonly XIcon = X;

  navItems = [
    { id: 'home', icon: Home, label: 'Explore' },
    { id: 'dashboard', icon: Grid3x3, label: 'Dashboard' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  handleTabChange(id: string) {
    this.tabChange.emit(id);
    this.mobileMenuOpen = false;
  }

  handleAddItem() {
    this.addItem.emit();
    this.mobileMenuOpen = false;
  }
}
