import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ItemDetailsComponent } from './pages/item-details/item-details.component';
import { PlaceholderComponent } from './pages/placeholder/placeholder.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
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

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'item/:id', component: ItemDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'book-item/:id', component: BookItemComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'support', component: SupportComponent },
  { path: 'add-item', component: AddItemComponent },
  { path: 'requests', component: RequestsComponent },
  { path: 'request/:id', component: RequestDetailsComponent },
  { path: 'privacy-safety', component: PrivacySafetyComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'edit-profile', component: EditProfileComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: 'request-item', component: RequestItemComponent },
  
  // Fallback
  { path: '**', redirectTo: 'home' }
];
