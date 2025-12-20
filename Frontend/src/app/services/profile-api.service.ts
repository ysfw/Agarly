import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfileDTO {
  profileImageUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  address: string;
  city: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/users';

  // Auth headers are added automatically by the auth interceptor

  getProfile(): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.baseUrl}/profile`);
  }

  updateProfile(profileData: UserProfileDTO): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, profileData);
  }

  changePassword(request: PasswordChangeRequest): Observable<any> {
    return this.http.patch(`${this.baseUrl}/password`, request);
  }
}
