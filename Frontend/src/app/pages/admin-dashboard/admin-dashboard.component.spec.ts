import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('AdminDashboardComponent', () => {
    let component: AdminDashboardComponent;
    let fixture: ComponentFixture<AdminDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminDashboardComponent],
            providers: [provideRouter([]), provideHttpClient()]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should switch tabs correctly', () => {
        component.setActiveTab('requests');
        expect(component.activeTab()).toBe('requests');

        component.setActiveTab('posts');
        expect(component.activeTab()).toBe('posts');
    });

    it('should return correct status badge class for APPROVED', () => {
        expect(component.getStatusBadgeClass('APPROVED')).toBe('bg-emerald-100 text-emerald-700');
    });

    it('should return correct status badge class for PENDING', () => {
        expect(component.getStatusBadgeClass('PENDING')).toBe('bg-amber-100 text-amber-700');
    });

    it('should return correct status badge class for REJECTED', () => {
        expect(component.getStatusBadgeClass('REJECTED')).toBe('bg-red-100 text-red-700');
    });

    it('should format owner name correctly', () => {
        const owner = { firstName: 'John', lastName: 'Doe', email: 'john@test.com' };
        expect(component.getOwnerName(owner)).toBe('John Doe');
    });

    it('should return Unknown for null owner', () => {
        expect(component.getOwnerName(null)).toBe('Unknown');
    });
});
