import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Bell, Shield, HelpCircle, LogOut, ChevronRight, Mail, MessageSquare, User } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly BellIcon = Bell;
  readonly ShieldIcon = Shield;
  readonly HelpCircleIcon = HelpCircle;
  readonly LogOutIcon = LogOut;
  readonly ChevronRightIcon = ChevronRight;
  readonly MailIcon = Mail;
  readonly MessageSquareIcon = MessageSquare;
  readonly UserIcon = User;

  private router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  changePassword() {
    this.router.navigate(['/password-change']);
  }

  handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
      this.router.navigate(['/login']);
    }
  }
}