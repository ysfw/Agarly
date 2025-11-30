import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;

  email = '';
  password = '';

  private router = inject(Router);

  handleSubmit() {
    // Backend logic goes here
    this.router.navigate(['/home']);
  }
}