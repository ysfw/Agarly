import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { AdminService } from './admin.service';

@Injectable({
    providedIn: 'root'
})
export class GuestGuard implements CanActivate {
    private authService = inject(AuthService);
    private adminService = inject(AdminService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const userAuth = this.authService.isAuthenticated();
        const adminAuth = this.adminService.isAuthenticated();

        console.log('GuestGuard: userAuth=', userAuth, 'adminAuth=', adminAuth);

        // Check regular user authentication first (more common case)
        if (userAuth) {
            console.log('GuestGuard: User is authenticated, redirecting to home');
            this.router.navigate(['/home'], { skipLocationChange: false, replaceUrl: true });
            return false;
        }

        // Then check admin authentication
        if (adminAuth) {
            console.log('GuestGuard: Admin is authenticated, redirecting to admin dashboard');
            this.router.navigate(['/admin-dashboard'], { skipLocationChange: false, replaceUrl: true });
            return false;
        }

        console.log('GuestGuard: User is guest, allowing access');
        return true;
    }
}
