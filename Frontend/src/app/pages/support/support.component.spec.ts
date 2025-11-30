import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportComponent } from './support.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, ArrowLeft, HelpCircle, MessageCircle, BookOpen, Mail, Send } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

describe('SupportComponent', () => {
  let component: SupportComponent;
  let fixture: ComponentFixture<SupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SupportComponent,
        RouterTestingModule,
        FormsModule,
        LucideAngularModule.pick({ ArrowLeft, HelpCircle, MessageCircle, BookOpen, Mail, Send })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
