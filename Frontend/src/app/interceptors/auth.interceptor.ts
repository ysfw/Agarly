import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { ModalService } from '../services/modal.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const adminService = inject(AdminService);
    const modalService = inject(ModalService);
    const router = inject(Router);

    // Get the token from AuthService (try user token first, then admin token)
    const userToken = authService.getToken();
    const adminToken = localStorage.getItem('adminToken');
    const token = userToken || adminToken;

    // Clone the request and add the Authorization header if token exists
    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Skip auto-logout for login and register endpoints
            const isAuthEndpoint = req.url.includes('/login') ||
                req.url.includes('/register') ||
                req.url.includes('/verify') ||
                req.url.includes('/gAuth') ||
                req.url.includes('/Admin-login');

            // Check if the error is a 401 Unauthorized
            if (error.status === 401) {
                if (!isAuthEndpoint) {
                    console.warn('401 Unauthorized - Logging out user');

                    // Check admin token first (more specific check)
                    const hasAdminToken = !!localStorage.getItem('adminToken');
                    const hasUserToken = !!authService.getToken();

                    if (hasAdminToken) {
                        console.log('Logging out admin due to 401');
                        adminService.logout();
                    } else if (hasUserToken) {
                        console.log('Logging out regular user due to 401');
                        authService.logout();
                    }
                }
            }

            // Check for connection refused or network errors (status 0)
            if (error.status === 0 && !isAuthEndpoint) {
                console.error('Connection refused or network error - Backend is unreachable');

                // Only logout if user is authenticated (to avoid logout loop on login page)
                if (adminService.isAuthenticated()) {
                    console.log('Backend unreachable - Logging out admin');
                    modalService.alert('Cannot connect to server. You will be logged out.', 'Connection Error')
                        .then(() => adminService.logout());
                } else if (authService.isAuthenticated()) {
                    console.log('Backend unreachable - Logging out regular user');
                    modalService.alert('Cannot connect to server. You will be logged out.', 'Connection Error')
                        .then(() => authService.logout());
                }
            }

            // Re-throw the error so it can still be handled by the calling code
            return throwError(() => error);
        })
    );
};
