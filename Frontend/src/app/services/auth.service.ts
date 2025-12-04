import { Injectable, signal } from '@angular/core';
import { UserDTO } from '../models/user';

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

  logout() {
    this.isLoggedIn.set(false);
  }
}
