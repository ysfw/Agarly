import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserDTO } from '../models/user';
import { environment } from '../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  registerUser(userData: UserDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/register`, userData, this.httpOptions);
  }

  loginUser(loginData: LoginCredentials): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/login`, loginData, this.httpOptions);
  }

  loginAdmin(data: LoginCredentials): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/Admin-login`, data, this.httpOptions);
  }

  sendToken(token: string): Observable<any> {
    const url = this.baseUrl + "/account/gAuth";
    return this.http.post(url, { idToken: token }, this.httpOptions);
  }

  sendOTP(userEmail: string, enteredOTP: string): Observable<any> {
    const params = new HttpParams()
      .set('email', userEmail)
      .set('otp', enteredOTP);
    const url = this.baseUrl + "/register/verify";
    return this.http.post(url, null, { params });
  }

  resendOTP(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.baseUrl}/register/resend-otp`, null, { params });
  }

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/items`);
  }

  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/items/${id}`);
  }

  // Search items
  searchItems(query: string, category?: string): Observable<Item[]> {
    let params = new HttpParams().set('q', query);
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<Item[]>(`${this.baseUrl}/items/search`, { params });
  }
}
