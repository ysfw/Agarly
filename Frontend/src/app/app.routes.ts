import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ItemDetailsComponent } from './pages/item-details/item-details.component';
import { PlaceholderComponent } from './pages/placeholder/placeholder.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { BookItemComponent } from './pages/book-item/book-item.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { SupportComponent } from './pages/support/support.component';
import { AddItemComponent } from './pages/add-item/add-item.component';
import { RequestsComponent } from './pages/requests/requests.component';
import { RequestDetailsComponent } from './pages/request-details/request-details.component';
import { PrivacySafetyComponent } from './pages/privacy-safety/privacy-safety.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { RequestItemComponent } from './pages/request-item/request-item.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { AuthGuard } from './services/auth-gaurd';
import { AdminAuthGuard } from './services/admin-auth.guard';
import { GuestGuard } from './services/guest.guard';
import { PasswordChange } from './pages/password-change/password-change';
import { TicketsComponent } from './pages/tickets/tickets';
import { UserProfileComponent } from './pages/user-profile/user-profile';
import { UserGuide } from './pages/user-guide/user-guide';


export const routes: Routes = [
  // Public routes (no AuthGuard)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'verify-email', component: VerifyEmailComponent, canActivate: [GuestGuard] },
  { path: 'admin-login', component: AdminLoginComponent, canActivate: [GuestGuard] },
  // Admin routes (should require AdminAuthGuard)
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AdminAuthGuard] },
  { path: 'item/:id', component: ItemDetailsComponent },
  // Protected routes (require AuthGuard)
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'password-change', component: PasswordChange, canActivate: [AuthGuard] },
  { path: 'book-item/:id', component: BookItemComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'support', component: SupportComponent, canActivate: [AuthGuard] },
  { path: 'user-guide', component: UserGuide, canActivate: [AuthGuard] },
  { path: 'add-item', component: AddItemComponent, canActivate: [AuthGuard] },
  { path: 'requests', component: RequestsComponent, canActivate: [AuthGuard] },
  { path: 'request/:id', component: RequestDetailsComponent, canActivate: [AuthGuard] },
  { path: 'privacy-safety', component: PrivacySafetyComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchResultsComponent, canActivate: [AuthGuard] },
  { path: 'request-item', component: RequestItemComponent, canActivate: [AuthGuard] },
  { path: 'tickets', component: TicketsComponent, canActivate: [AuthGuard] },
  { path: 'user/:id', component: UserProfileComponent }, // Public profile view (accessible by users and admins)
  { path: 'my-items', redirectTo: 'dashboard', pathMatch: 'full' }, // Consolidated into dashboard

  // Fallback
  { path: '**', redirectTo: 'home' }
];
