import {inject, Injectable, signal} from '@angular/core';
import { UserDTO } from '../models/user';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  otp = signal<string>('')
  email = signal<string>('');
  isLoggedIn = signal(false);
  userData = signal<UserDTO>({
    email : "",
    password : "",
    firstName : "",
    lastName : "",
    address : "",
    phoneNumber : "",
    username : "",
    activated : true,
    blocked : false
  })

  register(userData : UserDTO) {
    this.email.set(userData.email)
    this.userData.set(userData)
  }

  login() {
    this.isLoggedIn.set(true);
  }
  http = inject(HttpClient);
  router = inject(Router);

  setToken(token: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('isAuthenticated', 'true');
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

}
