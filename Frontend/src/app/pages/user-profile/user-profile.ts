import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, UserProfile } from '../../services/user.service';
import { Item } from '../../models/item.model';
import { LucideAngularModule, User, MapPin, Calendar, Package, Star, Loader2, ShieldAlert, BadgeCheck, Lock } from 'lucide-angular';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private location = inject(Location);

  // Icons
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly PackageIcon = Package;
  readonly StarIcon = Star;
  readonly LoaderIcon = Loader2;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly BadgeCheckIcon = BadgeCheck;
  readonly LockIcon = Lock;

  // State
  profile = signal<UserProfile | null>(null);
  items = signal<Item[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.error.set('Invalid user ID');
      this.loading.set(false);
      return;
    }

    this.loadProfile(+userId);
  }

  loadProfile(userId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        // Only load items if profile is not restricted
        if (!profile.isRestricted) {
          this.loadUserItems(userId);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error.set('Failed to load user profile');
        this.loading.set(false);
      }
    });
  }

  loadUserItems(userId: number): void {
    this.userService.getUserItems(userId).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading user items:', err);
        this.loading.set(false);
      }
    });
  }

  getFullName(): string {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  }

  getLocation(): string {
    const p = this.profile();
    if (!p) return 'Location not specified';
    const parts = [p.city, p.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }

  getInitials(): string {
    const p = this.profile();
    if (!p) return '?';
    const first = p.firstName?.[0] || '';
    const last = p.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }

  getItemImage(item: Item): string {
    return item.imageUrls?.[0] || 'https://via.placeholder.com/200x150?text=No+Image';
  }

  viewItem(itemId: number | undefined): void {
    if (itemId) {
      this.router.navigate(['/item', itemId]);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
