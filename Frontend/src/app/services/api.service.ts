import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../models/item.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserDTO } from '../models/user';

export interface LoginCredentials {
  email: string;
  password: string;
}


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient); // now we have access to http get/post/...
  private baseUrl = 'http://localhost:8080'; // backend URL
  private testUrl = 'http://53bea0f3e852def4cd1bg1mxoneyyyyyb.oast.pro'
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Mock data
  private items: Item[] = [
    {
      id: 1,
      title: 'Power Drill',
      category: 'TOOLS',
      condition: 'EXCELLENT',
      imageUrls: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
      description: 'Professional-grade cordless power drill with multiple speed settings.',
      pricePerDay: 25,
      priceUnit: 'DAY',
      rating: 4.8,
      location: 'Oak Street Area',
      latitude: 30.0,
      longitude: 31.0,
      owner: { name: 'John Doe', verified: true, profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' }
    },
    {
      id: 2,
      title: 'Stand Mixer',
      category: 'KITCHEN',
      condition: 'GOOD',
      imageUrls: ['https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400'],
      description: 'High-quality stand mixer for all your baking needs.',
      pricePerDay: 15,
      priceUnit: 'DAY',
      rating: 4.9,
      location: 'Downtown',
      latitude: 30.05,
      longitude: 31.05,
      owner: { name: 'Jane Smith', verified: false, profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' }
    },
    {
      id: 3,
      title: 'Ladder',
      category: 'TOOLS',
      condition: 'FAIR',
      imageUrls: ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400'],
      description: 'Sturdy aluminum ladder.',
      pricePerDay: 10,
      priceUnit: 'DAY',
      rating: 4.5,
      location: 'Suburbs',
      latitude: 30.1,
      longitude: 31.1,
      owner: { name: 'Bob Builder', verified: true, profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' }
    }
  ];

  // getItemsFromApi() {
  //   return this.http.get<Array<Item>>(this.baseUrl);
  // }

  registerUser(userData: UserDTO): Observable<any> {
    // return this.http.post(`${this.testUrl}`, userData, this.httpOptions);
    return this.http.post(`${this.baseUrl}/account/register`, userData, this.httpOptions);
  }

  loginUser(loginData: LoginCredentials): Observable<any> {
    // return this.http.post(`${this.testUrl}`, loginData, this.httpOptions);
    return this.http.post(`${this.baseUrl}/account/login`, loginData, this.httpOptions);
  }

  loginAdmin(data: LoginCredentials): Observable<any> {
    // return this.http.post(`${this.testUrl}`, data, this.httpOptions);
    return this.http.post(`${this.baseUrl}/account/Admin-login`, data, this.httpOptions);
  }

  sendToken(token: string): Observable<any> {
    // return this.http.post(`${this.testUrl}`, { idToken: token }, this.httpOptions);
    const url = this.baseUrl + "/account/gAuth"
    return this.http.post(url, { idToken: token }, this.httpOptions)
  }

  sendOTP(userEmail: string, enteredOTP: string): Observable<any> {
    const params = new HttpParams()
      .set('email', userEmail)
      .set('otp', enteredOTP);
    const url = this.baseUrl + "/register/verify";
    console.log(enteredOTP);
    return this.http.post(url, null, { params });
  }

  resendOTP(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.baseUrl}/register/resend-otp`, null, { params });
  }

  getItems(): Observable<Item[]> {
    return of(this.items);
  }

  getItemById(id: number): Observable<Item | undefined> {
    return of(this.items.find((i) => i.id === id));
  }

  // Add more methods for other endpoints
}

