import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, User, MapPin, Eye, EyeOff } from 'lucide-angular';
import { NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  showConfirmPassword = false;
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  };

  errors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  };

  // Reactive validation for each field
  ngOnChange(field: string) {
    this.validateField(field);
  }

  validateField(field: string) {
    switch (field) {
      case 'name':
        const name = this.formData.name.trim();
        const words = name.split(/\s+/);
        if (!name) this.errors.name = 'Name is required';
        else if (words.length < 2)
          this.errors.name = 'Enter at least two names';
        else if (words.some((w) => w.length < 3))
          this.errors.name = 'Each name part must be at least 3 characters';
        else if (!/^[A-Za-z ]+$/.test(name))
          this.errors.name = 'Name can only contain letters and spaces';
        else this.errors.name = '';
        break;

      case 'email':
        const email = this.formData.email.trim();
        if (!email) this.errors.email = 'Email is required';
        else if (!/^[A-Za-z0-9]/.test(email))
          this.errors.email = 'Email must start with a letter or number';
        else if (!/[A-Za-z0-9]$/.test(email))
          this.errors.email = 'Email must end with a letter or number';
        else if (!/^[A-Za-z0-9.]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))
          this.errors.email = 'Email format is invalid';
        else if (!/\.(com|eg|org|edu|net|gov)$/i.test(email))
          this.errors.email =
            'Email must end with a valid domain such as .com or .eg';
        else this.errors.email = '';
        break;

      case 'password':
        const password = this.formData.password;
        if (!password) this.errors.password = 'Password is required';
        else if (password.length < 8)
          this.errors.password = 'Password must be at least 8 characters';
        else if (!/[A-Z]/.test(password))
          this.errors.password = 'Must contain at least one uppercase letter';
        else if (!/[a-z]/.test(password))
          this.errors.password = 'Must contain at least one lowercase letter';
        else if (!/[0-9]/.test(password))
          this.errors.password = 'Must contain at least one number';
        else if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password))
          this.errors.password = 'Must contain at least one special character';
        else if (/\s/.test(password))
          this.errors.password = 'Password cannot contain spaces';
        else this.errors.password = '';
        break;

      case 'confirmPassword':
        this.errors.confirmPassword =
          this.formData.password !== this.formData.confirmPassword
            ? 'Passwords do not match'
            : '';
        break;

      case 'address':
        const address = this.formData.address.trim();
        const parts = address.split(/\s+/);
        if (!address) this.errors.address = 'Address is required';
        else if (parts.length < 4)
          this.errors.address =
            'Address must include: building street area country';
        else this.errors.address = '';
        break;
    }
  }

  validateForm() {
    // Validate all fields
    ['name', 'email', 'password', 'confirmPassword', 'address'].forEach((f) =>
      this.validateField(f)
    );

    // Check if there are any errors
    return Object.values(this.errors).every((e) => e === '');
  }

  loading = false; // true when submitting
  success = false; // true if registration succeeded
  backendError = ''; // in case backend returns error

  private router = inject(Router); // gives access to navigation
  private api = inject(ApiService);

  // handleSubmit() {      // placeholder for testing front
  //   if (!this.validateForm()) return;
  //   this.router.navigate(['/home']);
  // }

  handleSubmit() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.success = false;
    this.backendError = '';

    // Simulated backend call
    this.api.registerUser(this.formData).subscribe({
      next: () => {
        // a callback function called when the Observable emits a successful response
        this.loading = false;
        this.success = true;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        // a callback function called if the Observable emits an error
        this.loading = false;
        this.backendError = err?.message || 'Registration failed. Try again';
      },
    });
  }
}
