import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, User, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;

  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  };

  private router = inject(Router);

  ngOnChange() {
    console.log(`Name : ${this.formData.name}`)
    console.log(`Email : ${this.formData.email}`)
    console.log(`Password : ${this.formData.password}`)
    console.log(`confirmPassword : ${this.formData.confirmPassword}`)
    console.log(`Address : ${this.formData.address}`)
  }

  handleSubmit() {
    this.router.navigate(['/verify-email']);
  }
}