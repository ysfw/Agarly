import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestItemComponent } from './request-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, ArrowLeft, Calendar } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

describe('RequestItemComponent', () => {
  let component: RequestItemComponent;
  let fixture: ComponentFixture<RequestItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RequestItemComponent,
        RouterTestingModule,
        FormsModule,
        LucideAngularModule.pick({ ArrowLeft, Calendar })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
