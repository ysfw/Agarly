import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Bell, Shield, HelpCircle, LogOut, ChevronRight, Mail, MessageSquare, User, CreditCard, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { UserPreferencesService, UserPreferences } from '../../services/user-preferences.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly BellIcon = Bell;
  readonly ShieldIcon = Shield;
  readonly HelpCircleIcon = HelpCircle;
  readonly LogOutIcon = LogOut;
  readonly ChevronRightIcon = ChevronRight;
  readonly MailIcon = Mail;
  readonly MessageSquareIcon = MessageSquare;
  readonly UserIcon = User;
  readonly CreditCardIcon = CreditCard;
  readonly LoaderIcon = Loader2;

  private router = inject(Router);
  private authService = inject(AuthService);
  private preferencesService = inject(UserPreferencesService);

  // Notification preferences state
  pushNotifications = true;
  emailNotifications = true;
  smsNotifications = false;

  // Loading states
  loading = true;
  saving = false;
  logoutLoading = false;

  // Show logout confirmation modal
  showLogoutModal = false;

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    this.loading = true;
    this.preferencesService.getPreferences().subscribe({
      next: (prefs) => {
        this.pushNotifications = prefs.pushNotificationsEnabled;
        this.emailNotifications = prefs.emailNotificationsEnabled;
        this.smsNotifications = prefs.smsNotificationsEnabled;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading preferences:', err);
        this.loading = false;
      }
    });
  }

  async togglePushNotifications(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pushNotifications = target.checked;
    await this.savePreferences();
  }

  async toggleEmailNotifications(event: Event) {
    const target = event.target as HTMLInputElement;
    this.emailNotifications = target.checked;
    await this.savePreferences();
  }

  async toggleSmsNotifications(event: Event) {
    const target = event.target as HTMLInputElement;
    this.smsNotifications = target.checked;
    await this.savePreferences();
  }

  savePreferences() {
    this.saving = true;
    const prefs: UserPreferences = {
      pushNotificationsEnabled: this.pushNotifications,
      emailNotificationsEnabled: this.emailNotifications,
      smsNotificationsEnabled: this.smsNotifications
    };

    this.preferencesService.updatePreferences(prefs).subscribe({
      next: () => {
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving preferences:', err);
        this.saving = false;
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  changePassword() {
    this.router.navigate(['/password-change']);
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  handleLogout() {
    this.logoutLoading = true;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}