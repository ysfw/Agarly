import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminLoginComponent } from './admin-login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, Shield, Mail, Lock } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminLoginComponent,
        RouterTestingModule,
        FormsModule,
        LucideAngularModule.pick({ Shield, Mail, Lock })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
