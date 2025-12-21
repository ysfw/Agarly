import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { ProfileApiService, UserProfileDTO } from '../../services/profile-api.service';
import { AchievementService, Achievement } from '../../services/achievement.service';
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
  Loader2,
  Gift,
  Sparkles,
  Hand,
  Trophy,
  Rocket,
  CalendarCheck,
  Lock
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
  readonly GiftIcon = Gift;
  readonly SparklesIcon = Sparkles;
  readonly HandIcon = Hand;
  readonly TrophyIcon = Trophy;
  readonly RocketIcon = Rocket;
  readonly CalendarCheckIcon = CalendarCheck;
  readonly LockIcon = Lock;

  // Icon map for dynamic selection
  iconMap: { [key: string]: any } = {
    'heart': Heart,
    'award': Award,
    'leaf': Leaf,
    'message-circle': MessageCircle,
    'star': Star,
    'gift': Gift,
    'sparkles': Sparkles,
    'hand': Hand,
    'trophy': Trophy,
    'shield-check': ShieldCheck,
    'rocket': Rocket,
    'calendar-check': CalendarCheck
  };

  router = inject(Router);
  authService = inject(AuthService);
  private profileService = inject(ProfileApiService);
  private achievementService = inject(AchievementService);

  loading = signal(true);
  error = signal<string | null>(null);
  achievementsLoading = signal(true);

  profile = signal<UserProfileDTO>({
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
  });

  achievements = signal<Achievement[]>([]);
  totalPoints = signal(0);
  earnedCount = signal(0);

  ngOnInit() {
    this.loadProfile();
    this.loadAchievements();
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

  loadAchievements() {
    this.achievementsLoading.set(true);

    // First check for any new achievements
    this.achievementService.checkAchievements().subscribe({
      next: () => {
        // Then load all achievements
        this.achievementService.getAllAchievements().subscribe({
          next: (achievements) => {
            this.achievements.set(achievements);
            this.earnedCount.set(achievements.filter(a => a.earned).length);
            this.achievementsLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading achievements:', err);
            this.achievementsLoading.set(false);
          }
        });

        // Load total points
        this.achievementService.getTotalPoints().subscribe({
          next: (data) => {
            this.totalPoints.set(data.totalPoints);
          }
        });
      },
      error: () => {
        // Fallback: just load achievements without checking
        this.achievementService.getAllAchievements().subscribe({
          next: (achievements) => {
            this.achievements.set(achievements);
            this.achievementsLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading achievements:', err);
            this.achievementsLoading.set(false);
          }
        });
      }
    });
  }

  getIcon(iconName: string) {
    return this.iconMap[iconName] || this.AwardIcon;
  }

  getIconBgClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'red': 'bg-red-100',
      'yellow': 'bg-yellow-100',
      'green': 'bg-green-100',
      'blue': 'bg-blue-100',
      'purple': 'bg-purple-100',
      'orange': 'bg-orange-100',
      'gold': 'bg-amber-100',
      'teal': 'bg-teal-100'
    };
    return colorMap[color] || 'bg-gray-100';
  }

  getIconTextClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'red': 'text-red-500',
      'yellow': 'text-yellow-600',
      'green': 'text-green-600',
      'blue': 'text-blue-600',
      'purple': 'text-purple-600',
      'orange': 'text-orange-600',
      'gold': 'text-amber-600',
      'teal': 'text-teal-600'
    };
    return colorMap[color] || 'text-gray-600';
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