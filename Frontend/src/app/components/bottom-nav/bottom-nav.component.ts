import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Home, Grid3x3, User } from 'lucide-angular';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 safe-area-bottom">
      <div class="flex justify-around items-center max-w-md mx-auto">
        @for (tab of tabs; track tab.id) {
          <button (click)="onTabChange.emit(tab.id)" 
                  class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
                  [ngClass]="activeTab === tab.id ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'">
            <lucide-icon [img]="tab.icon" class="w-5 h-5" [class.fill-emerald-600]="activeTab === tab.id"></lucide-icon>
            <span class="text-xs">{{ tab.label }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class BottomNavComponent {
  @Input() activeTab: string = 'home';
  @Output() onTabChange = new EventEmitter<string>();

  readonly HomeIcon = Home;
  readonly Grid3x3Icon = Grid3x3;
  readonly UserIcon = User;

  tabs = [
    { id: 'home', icon: Home, label: 'Explore' },
    { id: 'dashboard', icon: Grid3x3, label: 'Dashboard' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];
}
