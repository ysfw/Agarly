import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserPreferences {
    pushNotificationsEnabled: boolean;
}

export interface PrivacySettings {
    profileVisibility: 'EVERYONE' | 'VERIFIED_ONLY' | 'PRIVATE';
    showContactInfo: boolean;
    hideAddress: boolean;
    onlyVerifiedMembers: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UserPreferencesService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080/api/user/preferences';

    getPreferences(): Observable<UserPreferences> {
        return this.http.get<UserPreferences>(this.baseUrl);
    }

    updatePreferences(prefs: UserPreferences): Observable<UserPreferences> {
        return this.http.put<UserPreferences>(this.baseUrl, prefs);
    }

    downloadData(): Observable<Blob> {
        return this.http.post(`${this.baseUrl}/download-data`, null, {
            responseType: 'blob'
        });
    }

    deleteAccount(): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/account`);
    }

    // Privacy settings methods
    getPrivacySettings(): Observable<PrivacySettings> {
        return this.http.get<PrivacySettings>(`${this.baseUrl}/privacy`);
    }

    updatePrivacySettings(settings: PrivacySettings): Observable<PrivacySettings> {
        return this.http.put<PrivacySettings>(`${this.baseUrl}/privacy`, settings);
    }
}
