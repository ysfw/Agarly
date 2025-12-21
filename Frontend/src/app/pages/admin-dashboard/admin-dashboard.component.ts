import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Shield, LogOut, Search, Trash2, Check, X, Package, User, Loader2, LifeBuoy, Mail, Clock } from 'lucide-angular';
import { AdminService, AdminItem, AdminRequest, DashboardStats, AdminSupportTicketDto, AdminTicketStatus } from '../../services/admin.service';

type SupportTicketStatus = AdminTicketStatus;

interface AdminSupportTicket {
    id: number;
    subject: string;
    message: string;
    status: SupportTicketStatus;
    createdAt: Date;
    user: {
        name: string;
        email: string;
    };
}

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
    readonly LifeBuoyIcon = LifeBuoy;
    readonly MailIcon = Mail;
    readonly ClockIcon = Clock;

    // State
    activeTab = signal<'posts' | 'requests' | 'users' | 'tickets'>('posts');
    searchQuery = signal('');
    loading = signal(true);
    error = signal<string | null>(null);

    // Data from API
    stats = signal<DashboardStats>({
        pendingPosts: 0,
        pendingRequests: 0,
        totalPosts: 0,
        totalRequests: 0,
        openTickets: 0,
        totalTickets: 0
    });

    posts = signal<AdminItem[]>([]);
    requests = signal<AdminRequest[]>([]);
    users = signal<any[]>([]);
    tickets = signal<AdminSupportTicket[]>([]);
    ticketFilter = signal<'ALL' | SupportTicketStatus>('ALL');
    ticketLoading = signal(false);
    ticketError = signal<string | null>(null);
    selectedTicket = signal<AdminSupportTicket | null>(null);
    openTicketCount = computed(() => this.tickets().filter(ticket => ticket.status !== 'CLOSED').length);

    // Computed statistics from API data
    pendingPosts = computed(() => this.stats().pendingPosts);
    pendingRequests = computed(() => this.stats().pendingRequests);
    totalPosts = computed(() => this.stats().totalPosts);
    totalRequests = computed(() => this.stats().totalRequests);
    openTicketsStat = computed(() => this.stats().openTickets);
    totalTicketsStat = computed(() => this.stats().totalTickets);
    searchPlaceholder = computed(() => {
        switch (this.activeTab()) {
            case 'posts':
                return 'Search Posts';
            case 'requests':
                return 'Search Requests';
            case 'users':
                return 'Search Users';
            case 'tickets':
                return 'Search Tickets';
            default:
                return 'Search';
        }
    });

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

    filteredTickets = computed(() => {
        const filter = this.ticketFilter();
        const query = this.searchQuery().toLowerCase().trim();

        return this.tickets().filter(ticket => {
            if (filter !== 'ALL' && ticket.status !== filter) {
                return false;
            }

            if (!query) return true;

            return ticket.subject.toLowerCase().includes(query) ||
                ticket.user.name.toLowerCase().includes(query) ||
                ticket.user.email.toLowerCase().includes(query) ||
                ticket.id.toString().includes(query);
        });
    });
    filteredOpenTicketCount = computed(() =>
        this.filteredTickets().filter(ticket => ticket.status !== 'CLOSED').length
    );
    filteredUsers = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.users();
        return this.users().filter(u =>
            (u.firstName?.toLowerCase().includes(query)) ||
            (u.lastName?.toLowerCase().includes(query)) ||
            (u.email?.toLowerCase().includes(query))
        );
    });

    setTicketFilter(filter: 'ALL' | SupportTicketStatus): void {
        this.loadTickets(filter);
    }

    private loadTickets(filter?: 'ALL' | SupportTicketStatus): void {
        const selectedFilter = filter ?? this.ticketFilter();
        this.ticketFilter.set(selectedFilter);
        this.ticketLoading.set(true);
        this.ticketError.set(null);

        const source$ = selectedFilter === 'PENDING'
            ? this.adminService.getPendingSupportTickets()
            : selectedFilter === 'OPEN'
                ? this.adminService.getOpenSupportTickets()
                : selectedFilter === 'CLOSED'
                    ? this.adminService.getClosedSupportTickets()
                    : this.adminService.getAllSupportTickets();

        source$.subscribe({
            next: (dtos) => {
                const mapped = dtos.map(dto => this.mapTicketDto(dto));
                this.tickets.set(mapped);
                this.openTicketCount();
                this.ticketLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading support tickets:', err);
                this.ticketError.set('Failed to load support tickets.');
                this.ticketLoading.set(false);
            }
        });
    }

    viewTicket(ticket: AdminSupportTicket): void {
        this.adminService.getSupportTicket(ticket.id).subscribe({
            next: (dto) => this.selectedTicket.set(this.mapTicketDto(dto)),
            error: () => this.selectedTicket.set(ticket)
        });
    }

    closeTicketDetail(): void {
        this.selectedTicket.set(null);
    }

    closeTicket(ticket: AdminSupportTicket): void {
        if (ticket.status === 'CLOSED') {
            return;
        }

        this.adminService.closeSupportTicket(ticket.id).subscribe({
            next: (dto) => {
                const updated = this.mapTicketDto(dto);
                this.replaceTicketInList(updated);
                const current = this.selectedTicket();
                if (current && current.id === updated.id) {
                    this.selectedTicket.set(updated);
                }
            },
            error: (err) => console.error('Error closing support ticket:', err)
        });
    }

    reopenTicket(ticket: AdminSupportTicket): void {
        if (ticket.status !== 'CLOSED') {
            return;
        }

        this.adminService.reopenSupportTicket(ticket.id).subscribe({
            next: (dto) => {
                const updated = this.mapTicketDto(dto);
                this.replaceTicketInList(updated);
                const current = this.selectedTicket();
                if (current && current.id === updated.id) {
                    this.selectedTicket.set(updated);
                }
            },
            error: (err) => console.error('Error reopening support ticket:', err)
        });
    }

    private mapTicketDto(dto: AdminSupportTicketDto): AdminSupportTicket {
        const name = dto.createdBy?.username || dto.createdBy?.email || 'Unknown user';
        const email = dto.createdBy?.email ?? 'Unknown';

        return {
            id: dto.id,
            subject: dto.subject,
            message: dto.message,
            status: (dto.status as SupportTicketStatus) ?? 'PENDING',
            createdAt: new Date(dto.createdAt),
            user: {
                name,
                email
            }
        };
    }

    private replaceTicketInList(updated: AdminSupportTicket): void {
        this.tickets.update(list => list.map(ticket => ticket.id === updated.id ? updated : ticket));
    }

    getTicketStatusBadgeClass(status: SupportTicketStatus): string {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-700';
            case 'OPEN':
                return 'bg-blue-100 text-blue-800';
            case 'CLOSED':
                return 'bg-emerald-100 text-emerald-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    }

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

        this.loadTickets(this.ticketFilter());
    }

    setActiveTab(tab: 'posts' | 'requests' | 'users' | 'tickets'): void {
        this.activeTab.set(tab);
        this.searchQuery.set(''); // Clear search when switching tabs
        if (tab === 'tickets') {
            this.loadTickets(this.ticketFilter());
        }
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
