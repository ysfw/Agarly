import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
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
  LogOut
} from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, LucideAngularModule],
  templateUrl: 'profile.component.html'
})
export class ProfileComponent {
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

  router = inject(Router);
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}