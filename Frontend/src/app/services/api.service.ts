import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../models/item.model';
import { HttpClient } from '@angular/common/http';

export interface UserRegistration {
  name: string;
  email: string;
  password: string;
  address: string;
}
export interface LoggingIn {
  email: string;
  password: string;
}


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient); // now we have access to http get/post/...
  private baseUrl = 'http://localhost:8080'; // backend URL

  // Mock data
  private items: Item[] = [
    {
      id: 1,
      name: 'Power Drill',
      category: 'Tools',
      distance: '0.3 mi',
      status: 'Available',
      image:
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
      description:
        'Professional-grade cordless power drill with multiple speed settings. Perfect for home improvement projects, furniture assembly, and general repairs. Includes battery and charger.',
      price: '$25/day',
      rating: 4.8,
      ownerImage:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      owner: { name: 'John Doe', verified: true },
      location: {
        area: 'Oak Street Area',
        description: 'Approximate location shown',
      },
    },
    {
      id: 2,
      name: 'Stand Mixer',
      category: 'Kitchen',
      distance: '0.5 mi',
      status: 'Available',
      image:
        'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400',
      price: '$15/day',
      rating: 4.9,
      ownerImage:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      },
      {
      id: 3,
      name: 'Ladder',
      category: 'Tools',
      distance: '0.8 mi',
      status: 'On Loan',
      image:
        'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400',
      price: '$10/day',
      rating: 4.5,
      ownerImage:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    },
    {
      id: 4,
      name: 'Pressure Washer',
      category: 'Cleaning',
      distance: '1.2 mi',
      status: 'Available',
      image:
        'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
      price: '$30/day',
      rating: 4.7,
      ownerImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
    {
      id: 5,
      name: 'Projector',
      category: 'Electronics',
      distance: '0.6 mi',
      status: 'Available',
      image:
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
      price: '$40/day',
      rating: 4.6,
      ownerImage:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400',
    },
    {
      id: 6,
      name: 'Carpet Cleaner',
      category: 'Cleaning',
      distance: '1.0 mi',
      status: 'Available',
      image:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      price: '$20/day',
      rating: 4.4,
      ownerImage:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    },
  ];

  // getItemsFromApi() {
  //   return this.http.get<Array<Item>>(this.baseUrl);
  // }

  registerUser(data: UserRegistration): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  loginUser(data: LoggingIn): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
  
  loginAdmin(data: LoggingIn): Observable<any> {
    return this.http.post(`${this.baseUrl}/Admin-login`, data);
  }
  

  getItems(): Observable<Item[]> {
    return of(this.items);
  }

  getItemById(id: number): Observable<Item | undefined> {
    return of(this.items.find((i) => i.id === id));
  }

  // Add more methods for other endpoints
}

