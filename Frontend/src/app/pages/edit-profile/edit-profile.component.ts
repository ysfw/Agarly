import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Camera, Upload, Link, Loader2, Check, X } from 'lucide-angular';
import { ProfileApiService, UserProfileDTO } from '../../services/profile-api.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CommonModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CameraIcon = Camera;
  readonly UploadIcon = Upload;
  readonly LinkIcon = Link;
  readonly LoaderIcon = Loader2;
  readonly CheckIcon = Check;
  readonly XIcon = X;

  router = inject(Router);
  private profileService = inject(ProfileApiService);

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  showImageModal = signal(false);
  imageUrlInput = '';

  formData: UserProfileDTO = {
    profileImageUrl: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    address: '',
    city: '',
    itemsShared: 0,
    itemsBorrowed: 0,
    averageRating: 0,
    reviewCount: 0
  };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.error.set(null);

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.formData = { ...profile };
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error.set('Failed to load profile. Please try again.');
        this.loading.set(false);
      }
    });
  }

  handleSubmit() {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    this.profileService.updateProfile(this.formData).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.error.set('Failed to update profile. Please try again.');
        this.saving.set(false);
      }
    });
  }

  getInitials(): string {
    const first = this.formData.firstName?.charAt(0) || '';
    const last = this.formData.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  openImageModal() {
    this.showImageModal.set(true);
    this.imageUrlInput = this.formData.profileImageUrl || '';
  }

  closeImageModal() {
    this.showImageModal.set(false);
    this.imageUrlInput = '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error.set('Image must be less than 2MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        this.error.set('Only JPG, PNG, and GIF images are allowed');
        return;
      }

      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.profileImageUrl = e.target?.result as string;
        this.closeImageModal();
      };
      reader.readAsDataURL(file);
    }
  }

  setImageFromUrl() {
    if (this.imageUrlInput && this.isValidUrl(this.imageUrlInput)) {
      this.formData.profileImageUrl = this.imageUrlInput;
      this.closeImageModal();
    } else {
      this.error.set('Please enter a valid image URL');
    }
  }

  isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  removeProfileImage() {
    this.formData.profileImageUrl = '';
    this.closeImageModal();
  }
}