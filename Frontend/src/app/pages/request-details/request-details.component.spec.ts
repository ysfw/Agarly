import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestDetailsComponent } from './request-details.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, ArrowLeft, Calendar, User, CheckCircle } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

describe('RequestDetailsComponent', () => {
  let component: RequestDetailsComponent;
  let fixture: ComponentFixture<RequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RequestDetailsComponent,
        RouterTestingModule,
        FormsModule,
        LucideAngularModule.pick({ ArrowLeft, Calendar, User, CheckCircle })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
