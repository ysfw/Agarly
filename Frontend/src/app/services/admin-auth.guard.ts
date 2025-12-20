import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AdminService } from './admin.service';

@Injectable({
    providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
    private adminService = inject(AdminService);
    private router = inject(Router);

    canActivate(): boolean | UrlTree {
        if (this.adminService.isAuthenticated()) {
            return true;
        }

        // Redirect to admin login if not authenticated
        return this.router.createUrlTree(['/admin-login']);
    }
}
