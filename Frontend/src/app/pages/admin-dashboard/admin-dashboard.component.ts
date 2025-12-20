import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Shield, LogOut, Search, Trash2, Check, X, Package, User, Loader2 } from 'lucide-angular';
import { AdminService, AdminItem, AdminRequest, DashboardStats } from '../../services/admin.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
    private router = inject(Router);
    private adminService = inject(AdminService);

    // Icons
    readonly ShieldIcon = Shield;
    readonly LogOutIcon = LogOut;
    readonly SearchIcon = Search;
    readonly TrashIcon = Trash2;
    readonly CheckIcon = Check;
    readonly XIcon = X;
    readonly PackageIcon = Package;
    readonly UserIcon = User;
    readonly LoaderIcon = Loader2;

    // State
    activeTab = signal<'posts' | 'requests' | 'users'>('posts');
    searchQuery = signal('');
    loading = signal(true);
    error = signal<string | null>(null);

    // Data from API
    stats = signal<DashboardStats>({
        pendingPosts: 0,
        pendingRequests: 0,
        totalPosts: 0,
        totalRequests: 0
    });

    posts = signal<AdminItem[]>([]);
    requests = signal<AdminRequest[]>([]);
    users = signal<any[]>([]);

    // Computed statistics from API data
    pendingPosts = computed(() => this.stats().pendingPosts);
    pendingRequests = computed(() => this.stats().pendingRequests);
    totalPosts = computed(() => this.stats().totalPosts);
    totalRequests = computed(() => this.stats().totalRequests);

    // Filtered lists based on search
    filteredPosts = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.posts();
        return this.posts().filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.owner?.firstName?.toLowerCase().includes(query)) ||
            (p.owner?.lastName?.toLowerCase().includes(query)) ||
            p.category?.toLowerCase().includes(query)
        );
    });

    filteredRequests = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.requests();
        return this.requests().filter(r =>
            r.title.toLowerCase().includes(query) ||
            (r.requester?.firstName?.toLowerCase().includes(query)) ||
            (r.requester?.lastName?.toLowerCase().includes(query)) ||
            r.category?.toLowerCase().includes(query)
        );
    });

    goToSupportTickets(): void {
        this.router.navigate(['/admin-tickets']);
    }
    filteredUsers = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.users();
        return this.users().filter(u =>
            (u.firstName?.toLowerCase().includes(query)) ||
            (u.lastName?.toLowerCase().includes(query)) ||
            (u.email?.toLowerCase().includes(query))
        );
    });

    ngOnInit(): void {
        // Check if admin is authenticated
        if (!this.adminService.isAuthenticated()) {
            this.router.navigate(['/admin-login']);
            return;
        }
        this.loadData();
    }

    loadData(): void {
        this.loading.set(true);
        this.error.set(null);

        // Load stats
        this.adminService.getDashboardStats().subscribe({
            next: (stats) => this.stats.set(stats),
            error: (err) => console.error('Error loading stats:', err)
        });

        // Load items
        this.adminService.getItems().subscribe({
            next: (items) => {
                this.posts.set(items);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading items:', err);
                this.error.set('Failed to load items');
                this.loading.set(false);
            }
        });

        // Load requests
        this.adminService.getRequests().subscribe({
            next: (requests) => this.requests.set(requests),
            error: (err) => console.error('Error loading requests:', err)
        });

        // Load users
        this.adminService.getUsers().subscribe({
            next: (users) => this.users.set(users),
            error: (err) => console.error('Error loading users:', err)
        });
    }

    setActiveTab(tab: 'posts' | 'requests' | 'users'): void {
        this.activeTab.set(tab);
        this.searchQuery.set(''); // Clear search when switching tabs
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchQuery.set(target.value);
    }

    // Item actions
    approvePost(post: AdminItem): void {
        this.adminService.approveItem(post.id).subscribe({
            next: () => {
                this.posts.update(posts =>
                    posts.map(p => p.id === post.id ? { ...p, status: 'APPROVED' as const } : p)
                );
                this.refreshStats();
            },
            error: (err) => console.error('Error approving item:', err)
        });
    }

    rejectPost(post: AdminItem): void {
        this.adminService.rejectItem(post.id).subscribe({
            next: () => {
                this.posts.update(posts =>
                    posts.map(p => p.id === post.id ? { ...p, status: 'REJECTED' as const } : p)
                );
                this.refreshStats();
            },
            error: (err) => console.error('Error rejecting item:', err)
        });
    }

    deletePost(post: AdminItem): void {
        if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
            this.adminService.deleteItem(post.id).subscribe({
                next: () => {
                    this.posts.update(posts => posts.filter(p => p.id !== post.id));
                    this.refreshStats();
                },
                error: (err) => console.error('Error deleting item:', err)
            });
        }
    }

    // Request actions
    approveRequest(request: AdminRequest): void {
        this.adminService.approveRequest(request.id).subscribe({
            next: () => {
                this.requests.update(requests =>
                    requests.map(r => r.id === request.id ? { ...r, status: 'APPROVED' as const } : r)
                );
                this.refreshStats();
            },
            error: (err) => console.error('Error approving request:', err)
        });
    }

    rejectRequest(request: AdminRequest): void {
        this.adminService.rejectRequest(request.id).subscribe({
            next: () => {
                this.requests.update(requests =>
                    requests.map(r => r.id === request.id ? { ...r, status: 'REJECTED' as const } : r)
                );
                this.refreshStats();
            },
            error: (err) => console.error('Error rejecting request:', err)
        });
    }

    deleteRequest(request: AdminRequest): void {
        if (confirm(`Are you sure you want to delete "${request.title}"?`)) {
            this.adminService.deleteRequest(request.id).subscribe({
                next: () => {
                    this.requests.update(requests => requests.filter(r => r.id !== request.id));
                    this.refreshStats();
                },
                error: (err) => console.error('Error deleting request:', err)
            });
        }
    }

    private refreshStats(): void {
        this.adminService.getDashboardStats().subscribe({
            next: (stats) => this.stats.set(stats),
            error: (err) => console.error('Error refreshing stats:', err)
        });
    }

    getStatusBadgeClass(status: 'APPROVED' | 'PENDING' | 'REJECTED'): string {
        switch (status) {
            case 'APPROVED':
                return 'bg-emerald-100 text-emerald-700';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700';
            case 'REJECTED':
                return 'bg-red-100 text-red-700';
        }
    }

    getStatusLabel(status: 'APPROVED' | 'PENDING' | 'REJECTED'): string {
        return status.charAt(0) + status.slice(1).toLowerCase();
    }

    getOwnerName(owner: { firstName?: string; lastName?: string; email?: string } | null): string {
        if (!owner) return 'Unknown';
        if (owner.firstName || owner.lastName) {
            return `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
        }
        return owner.email || 'Unknown';
    }

    getRequesterName(requester: { firstName?: string; lastName?: string; email?: string } | null): string {
        return this.getOwnerName(requester);
    }

    formatDate(dateString: string | null): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    }

    getItemThumbnail(post: AdminItem): string {
        if (post.imageUrls && post.imageUrls.length > 0) {
            return post.imageUrls[0];
        }
        // Default placeholder image
        return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop';
    }

    // User actions
    banUser(user: any): void {
        if (confirm(`Are you sure you want to ban ${this.getOwnerName(user)}?`)) {
            this.adminService.banUser(user.id).subscribe({
                next: () => {
                    // Reload users
                    this.adminService.getUsers().subscribe({
                        next: (users) => this.users.set(users)
                    });
                },
                error: (err) => console.error('Error banning user:', err)
            });
        }
    }

    unbanUser(user: any): void {
        this.adminService.unbanUser(user.id).subscribe({
            next: () => {
                // Reload users
                this.adminService.getUsers().subscribe({
                    next: (users) => this.users.set(users)
                });
            },
            error: (err) => console.error('Error unbanning user:', err)
        });
    }

    viewUserProfile(userId: number): void {
        this.router.navigate(['/user', userId]);
    }

    logout(): void {
        this.adminService.logout();
    }
}
