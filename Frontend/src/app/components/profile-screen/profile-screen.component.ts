import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Settings, Shield, Star } from 'lucide-angular';

@Component({
  selector: 'app-profile-screen',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: 'profile-screen.component.html'
})
export class ProfileScreenComponent {
  @Output() onBack = new EventEmitter<void>();

  private router = inject(Router);

  readonly SettingsIcon = Settings;
  readonly ShieldIcon = Shield;
  readonly StarIcon = Star;

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    // Implement logout logic here (e.g., clear tokens)
    this.router.navigate(['/login']);
  }
}