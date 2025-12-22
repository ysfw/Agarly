import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Achievement {
    id: number;
    code: string;
    name: string;
    description: string;
    iconName: string;
    iconColor: string;
    category: string;
    requiredCount: number;
    points: number;
    earned: boolean;
    earnedAt?: string;
    currentProgress: number;
    progressPercentage: number;
}

@Injectable({
    providedIn: 'root'
})
export class AchievementService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/api/achievements`;

    /**
     * Get all achievements with earned status and progress
     */
    getAllAchievements(): Observable<Achievement[]> {
        return this.http.get<Achievement[]>(this.baseUrl);
    }

    /**
     * Get only earned achievements
     */
    getEarnedAchievements(): Observable<Achievement[]> {
        return this.http.get<Achievement[]>(`${this.baseUrl}/earned`);
    }

    /**
     * Get achievements for a specific user (public)
     */
    getUserAchievements(userId: number): Observable<Achievement[]> {
        return this.http.get<Achievement[]>(`${this.baseUrl}/user/${userId}`);
    }

    /**
     * Check and award any new achievements
     */
    checkAchievements(): Observable<Achievement[]> {
        return this.http.post<Achievement[]>(`${this.baseUrl}/check`, {});
    }

    /**
     * Get achievement notifications (newly earned)
     */
    getNotifications(): Observable<Achievement[]> {
        return this.http.get<Achievement[]>(`${this.baseUrl}/notifications`);
    }

    /**
     * Get total achievement points
     */
    getTotalPoints(): Observable<{ totalPoints: number }> {
        return this.http.get<{ totalPoints: number }>(`${this.baseUrl}/points`);
    }

    /**
     * Map icon name to Lucide icon component name
     */
    getIconComponent(iconName: string): string {
        const iconMap: { [key: string]: string } = {
            'heart': 'Heart',
            'award': 'Award',
            'leaf': 'Leaf',
            'message-circle': 'MessageCircle',
            'star': 'Star',
            'gift': 'Gift',
            'sparkles': 'Sparkles',
            'hand': 'Hand',
            'trophy': 'Trophy',
            'shield-check': 'ShieldCheck',
            'rocket': 'Rocket',
            'calendar-check': 'CalendarCheck'
        };
        return iconMap[iconName] || 'Award';
    }

    /**
     * Get Tailwind color classes for icon
     */
    getColorClasses(color: string): { bg: string, text: string } {
        const colorMap: { [key: string]: { bg: string, text: string } } = {
            'red': { bg: 'bg-red-100', text: 'text-red-500' },
            'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            'green': { bg: 'bg-green-100', text: 'text-green-600' },
            'blue': { bg: 'bg-[#E8EAF6]', text: 'text-[#3949AB]' },
            'purple': { bg: 'bg-purple-100', text: 'text-purple-600' },
            'orange': { bg: 'bg-orange-100', text: 'text-orange-600' },
            'gold': { bg: 'bg-amber-100', text: 'text-amber-600' },
            'teal': { bg: 'bg-teal-100', text: 'text-teal-600' }
        };
        return colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
}
