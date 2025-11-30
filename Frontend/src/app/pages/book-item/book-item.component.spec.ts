import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookItemComponent } from './book-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, ArrowLeft, Calendar, CheckCircle, AlertCircle } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

describe('BookItemComponent', () => {
  let component: BookItemComponent;
  let fixture: ComponentFixture<BookItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BookItemComponent,
        RouterTestingModule,
        FormsModule,
        LucideAngularModule.pick({ ArrowLeft, Calendar, CheckCircle, AlertCircle })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
