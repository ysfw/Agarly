import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacySafetyComponent } from './privacy-safety.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, UserX, AlertTriangle } from 'lucide-angular';

describe('PrivacySafetyComponent', () => {
  let component: PrivacySafetyComponent;
  let fixture: ComponentFixture<PrivacySafetyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PrivacySafetyComponent,
        RouterTestingModule,
        LucideAngularModule.pick({ ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, UserX, AlertTriangle })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacySafetyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
