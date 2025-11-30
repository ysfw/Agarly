import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, UserX, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-privacy-safety',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './privacy-safety.component.html',
  styleUrl: './privacy-safety.component.css'
})
export class PrivacySafetyComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly LockIcon = Lock;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly UserXIcon = UserX;
  readonly AlertTriangleIcon = AlertTriangle;

  router = inject(Router);

  alertData() {
    alert('Download your data');
  }

  handleDelete() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested');
    }
  }
}