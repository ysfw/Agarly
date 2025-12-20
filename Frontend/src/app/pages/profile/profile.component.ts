import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { ProfileApiService, UserProfileDTO } from '../../services/profile-api.service';
import { 
  LucideAngularModule, 
  Settings, 
  ShieldCheck, 
  Star, 
  Package, 
  TrendingUp, 
  Award, 
  Edit,
  Check,
  Plus,
  Leaf,
  MessageCircle,
  Heart,
  LogOut,
  Loader2
} from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, LucideAngularModule, CommonModule],
  templateUrl: 'profile.component.html'
})
export class ProfileComponent implements OnInit {
  // Icons mapping
  readonly SettingsIcon = Settings;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly StarIcon = Star;
  readonly PackageIcon = Package;
  readonly TrendingUpIcon = TrendingUp;
  readonly AwardIcon = Award;
  readonly EditIcon = Edit;
  readonly CheckIcon = Check;
  readonly PlusIcon = Plus;
  readonly LeafIcon = Leaf;
  readonly MessageCircleIcon = MessageCircle;
  readonly HeartIcon = Heart;
  readonly LogOutIcon = LogOut;
  readonly LoaderIcon = Loader2;

  router = inject(Router);
  authService = inject(AuthService);
  private profileService = inject(ProfileApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  
  profile = signal<UserProfileDTO>({
    profileImageUrl: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    address: '',
    city: ''
  });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.error.set(null);
    
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error.set('Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  getInitials(): string {
    const first = this.profile().firstName?.charAt(0) || '';
    const last = this.profile().lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  getFullName(): string {
    return `${this.profile().firstName || ''} ${this.profile().lastName || ''}`.trim() || 'User';
  }

  logout() {
    this.authService.logout();
  }
}