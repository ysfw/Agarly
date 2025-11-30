import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, Shield } from 'lucide-angular';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  readonly ShieldIcon = Shield;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;

  email = '';
  password = '';

  private router = inject(Router);

  handleSubmit() {
    this.router.navigate(['/home']);
  }
}