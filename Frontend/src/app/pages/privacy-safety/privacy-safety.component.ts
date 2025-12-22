import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, AlertTriangle, Download, Trash2, Loader2 } from 'lucide-angular';
import { UserPreferencesService, PrivacySettings } from '../../services/user-preferences.service';

@Component({
  selector: 'app-privacy-safety',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './privacy-safety.component.html',
  styleUrl: './privacy-safety.component.css'
})
export class PrivacySafetyComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly LockIcon = Lock;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly DownloadIcon = Download;
  readonly TrashIcon = Trash2;
  readonly LoaderIcon = Loader2;

  router = inject(Router);
  private preferencesService = inject(UserPreferencesService);

  // Privacy settings state
  privacySettings: PrivacySettings = {
    profileVisibility: 'EVERYONE',
    showContactInfo: false,
    hideAddress: true,
    onlyVerifiedMembers: true
  };

  // Loading states
  downloadingData = false;
  deletingAccount = false;
  savingPrivacy = false;

  // Modal states
  showDeleteModal = false;
  deleteConfirmText = '';

  // Status messages
  downloadSuccess = false;
  errorMessage = '';

  ngOnInit() {
    this.loadPrivacySettings();
  }

  loadPrivacySettings() {
    this.preferencesService.getPrivacySettings().subscribe({
      next: (settings) => {
        this.privacySettings = settings;
      },
      error: (err) => {
        console.error('Error loading privacy settings:', err);
        // Use defaults if loading fails
      }
    });
  }

  savePrivacySettings() {
    this.savingPrivacy = true;
    this.preferencesService.updatePrivacySettings(this.privacySettings).subscribe({
      next: () => {
        this.savingPrivacy = false;
      },
      error: (err) => {
        console.error('Error saving privacy settings:', err);
        this.savingPrivacy = false;
        this.errorMessage = 'Failed to save privacy settings.';
      }
    });
  }

  toggleShowContactInfo(event: Event) {
    const target = event.target as HTMLInputElement;
    this.privacySettings.showContactInfo = target.checked;
    this.savePrivacySettings();
  }

  toggleHideAddress(event: Event) {
    const target = event.target as HTMLInputElement;
    this.privacySettings.hideAddress = target.checked;
    this.savePrivacySettings();
  }

  toggleOnlyVerifiedMembers(event: Event) {
    const target = event.target as HTMLInputElement;
    this.privacySettings.onlyVerifiedMembers = target.checked;
    this.savePrivacySettings();
  }

  goBack() {
    this.router.navigate(['/settings']);
  }

  downloadData() {
    this.downloadingData = true;
    this.downloadSuccess = false;
    this.errorMessage = '';

    this.preferencesService.downloadData().subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-agarly-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.downloadingData = false;
        this.downloadSuccess = true;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.downloadSuccess = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Error downloading data:', err);
        this.downloadingData = false;
        this.errorMessage = 'Failed to download your data. Please try again.';
      }
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
    this.deleteConfirmText = '';
    this.errorMessage = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteConfirmText = '';
  }

  confirmDelete() {
    if (this.deleteConfirmText !== 'DELETE') {
      this.errorMessage = 'Please type DELETE to confirm';
      return;
    }

    this.deletingAccount = true;
    this.errorMessage = '';

    this.preferencesService.deleteAccount().subscribe({
      next: (response) => {
        this.deletingAccount = false;
        // Clear local storage and redirect
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error deleting account:', err);
        this.deletingAccount = false;
        this.errorMessage = 'Failed to delete account. Please try again or contact support.';
      }
    });
  }
}