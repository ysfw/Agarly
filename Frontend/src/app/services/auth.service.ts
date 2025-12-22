import { inject, Injectable, signal } from '@angular/core';
import { UserDTO } from '../models/user';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  otp = signal<string>('')
  email = signal<string>('');

  // Initialize isLoggedIn from localStorage
  isLoggedIn = signal(localStorage.getItem('isAuthenticated') === 'true');

  // Track email verification status
  isVerified = signal(localStorage.getItem('isVerified') === 'true');

  // Subject to notify when login occurs (to break circular dependency)
  private loginSuccessSubject = new Subject<void>();
  public loginSuccess$ = this.loginSuccessSubject.asObservable();

  // Subject to notify when logout occurs
  private logoutSubject = new Subject<void>();
  public logout$ = this.logoutSubject.asObservable();

  userData = signal<UserDTO>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    username: "",
    activated: true,
    blocked: false,
    verified: false
  })

  http = inject(HttpClient);
  router = inject(Router);

  register(userData: UserDTO) {
    this.email.set(userData.email)
    this.userData.set(userData)
  }

  login() {
    this.isLoggedIn.set(true);
    // Emit login success event for EventService to listen
    this.loginSuccessSubject.next();
  }

  setToken(token: string, verified?: boolean, username?: string, email?: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('isAuthenticated', 'true');
    this.isLoggedIn.set(true);

    if (verified !== undefined) {
      localStorage.setItem('isVerified', verified.toString());
      this.isVerified.set(verified);
    }
    if (username) {
      localStorage.setItem('username', username);
    }
    if (email) {
      localStorage.setItem('userEmail', email);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    const isAuth = localStorage.getItem('isAuthenticated');
    console.log('AuthService.isAuthenticated() checking:', isAuth);
    return isAuth === 'true';
  }

  logout() {
    // Emit logout event before clearing data
    this.logoutSubject.next();
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isVerified');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    this.isLoggedIn.set(false);
    this.isVerified.set(false);
    this.router.navigate(['/login']);
  }

  setVerified(verified: boolean) {
    localStorage.setItem('isVerified', verified.toString());
    this.isVerified.set(verified);
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

}
