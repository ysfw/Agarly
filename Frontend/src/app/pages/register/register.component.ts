import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, User, MapPin, Eye, EyeOff, Phone } from 'lucide-angular';
import { NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { UserDTO } from 'src/app/models/user';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  // Icons for the form 
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly PhoneIcon = Phone;

  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  showConfirmPassword = false;
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  formData = {
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  };

  errors = {
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
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
      case 'firstName':
        if (!this.formData.firstName.trim()) this.errors.firstName = 'First name is required';
        else if (!/^[A-Za-z]+$/.test(this.formData.firstName.trim()))
          this.errors.firstName = 'First name can only contain letters';
        else this.errors.firstName = '';
        break;

      case 'lastName':
        if (!this.formData.lastName.trim()) this.errors.lastName = 'Last name is required';
        else if (!/^[A-Za-z]+$/.test(this.formData.lastName.trim()))
          this.errors.lastName = 'Last name can only contain letters';
        else this.errors.lastName = '';
        break;

      case 'username':
        if (!this.formData.username.trim()) this.errors.username = 'Username is required';
        else if (this.formData.username.length < 3)
          this.errors.username = 'Username must be at least 3 characters';
        else this.errors.username = '';
        break;

      case 'phoneNumber':
        if (!this.formData.phoneNumber.trim()) this.errors.phoneNumber = 'Phone number is required';
        else if (!/^\d{11}$/.test(this.formData.phoneNumber.trim()))
          this.errors.phoneNumber = 'Phone number must be 11 digits';
        else this.errors.phoneNumber = '';
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
    ['name', 'username', 'firstName', 'lastName', 'phoneNumber', 'email', 'password', 'confirmPassword', 'address'].forEach((f) =>
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
  authService = inject(AuthService);

  // handleSubmit() {      // placeholder for testing front
  //   if (!this.validateForm()) return;
  //   this.authService.login();

  // }

  handleSubmit() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.success = false;
    this.backendError = '';

    const userData: UserDTO = {
      username: this.formData.username,
      password: this.formData.password,
      email: this.formData.email,
      phoneNumber: this.formData.phoneNumber,
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      address: this.formData.address,
      activated: true,
      blocked: false
    }

    this.api.registerUser(userData).subscribe({
      next: (response : any) => {
        // a callback function called when the Observable emits a successful response
        console.log("Response from backend: ", response)
        this.loading = false;
        this.success = true;
        this.authService.login();
        this.authService.register(userData)
        this.router.navigate(['/verify-email']);
      },
      error: (err : HttpErrorResponse) => {
        // a callback function called if the Observable emits an error
        console.error('An error occurred, Status Code:', err.status)
        console.error('Error body:', err.error)
        this.loading = false;
        this.backendError = 'Registration failed. Try again';
      },
    });
  }
}
