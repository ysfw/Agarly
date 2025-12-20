import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { LucideAngularModule, Plus, Edit, Trash2, Search, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-angular';
import { NavbarLoggedInComponent } from '../../components/navbar-logged-in/navbar-logged-in.component';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-my-items',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, NavbarLoggedInComponent, FormsModule],
    templateUrl: './my-items.component.html',
    styleUrl: './my-items.component.css'
})
export class MyItemsComponent implements OnInit {
    itemService = inject(ItemService);
    router = inject(Router);

    activeTab: 'lent' | 'borrowed' = 'lent';
    lentItems: Item[] = [];
    borrowedItems: Item[] = [];
    loading = true;

    readonly PlusIcon = Plus;
    readonly EditIcon = Edit;
    readonly TrashIcon = Trash2;
    readonly SearchIcon = Search;
    readonly CalendarIcon = Calendar;
    readonly UserIcon = User;
    readonly CheckCircleIcon = CheckCircle;
    readonly ClockIcon = Clock;
    readonly AlertCircleIcon = AlertCircle;

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.loading = true;
        // Load lent items
        this.itemService.getMyLentItems().subscribe({
            next: (items) => {
                this.lentItems = items;
                this.checkLoadingComplete();
            },
            error: (err) => {
                console.error('Error loading lent items:', err);
                this.checkLoadingComplete();
            }
        });

        // Load borrowed items
        this.itemService.getMyBorrowedItems().subscribe({
            next: (items) => {
                this.borrowedItems = items;
                this.checkLoadingComplete();
            },
            error: (err) => {
                console.error('Error loading borrowed items:', err);
                this.checkLoadingComplete();
            }
        });
    }

    private loadingCount = 0;
    private checkLoadingComplete() {
        this.loadingCount++;
        if (this.loadingCount >= 2) {
            this.loading = false;
            this.loadingCount = 0;
        }
    }

    setActiveTab(tab: 'lent' | 'borrowed') {
        this.activeTab = tab;
    }

    deleteItem(id: number) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.itemService.delete(id).subscribe({
                next: () => {
                    if (this.activeTab === 'lent') {
                        this.lentItems = this.lentItems.filter(item => item.id !== id);
                    } else {
                        this.borrowedItems = this.borrowedItems.filter(item => item.id !== id);
                    }
                },
                error: (err) => {
                    console.error('Error deleting item:', err);
                    alert('Failed to delete item.');
                }
            });
        }
    }

    editItem(id: number) {
        // TODO: Navigate to edit page
        // this.router.navigate(['/edit-item', id]);
        alert('Edit functionality coming soon!');
    }

    navigateToAddItem() {
        this.router.navigate(['/add-item']);
    }

    navigateToHome() {
        this.router.navigate(['/home']);
    }

    contactBorrower(item: Item) {
        // Mock chat navigation
        alert(`Opening chat with ${item.borrower?.name || item.owner?.name}...`);
        // this.router.navigate(['/chat', item.borrower?.id]);
    }

    isLendModalOpen = false;
    lendForm = {
        email: '',
        dueDate: '',
        itemId: null as number | null
    };

    openLendModal(item: Item) {
        this.lendForm = {
            email: '',
            dueDate: '',
            itemId: item.id || null
        };
        this.isLendModalOpen = true;
    }

    closeLendModal() {
        this.isLendModalOpen = false;
    }

    submitLend() {
        if (!this.lendForm.email || !this.lendForm.itemId) {
            alert('Please enter borrower email');
            return;
        }

        this.itemService.lend(this.lendForm.itemId, this.lendForm.email, this.lendForm.dueDate || undefined).subscribe({
            next: () => {
                this.closeLendModal();
                this.loadItems(); // Refresh list
            },
            error: (err) => {
                console.error('Error marking as lent:', err);
                alert('Failed to mark as lent. Ensure user exists.');
            }
        });
    }

    markAsReturned(item: Item) {
        if (confirm(`Mark ${item.title} as returned?`)) {
            this.itemService.returnItem(item.id!).subscribe({
                next: () => {
                    alert('Item marked as returned!');
                    this.loadItems(); // Refresh list
                },
                error: (err) => {
                    console.error('Error marking as returned:', err);
                    alert('Failed to mark as returned.');
                }
            });
        }
    }
}
