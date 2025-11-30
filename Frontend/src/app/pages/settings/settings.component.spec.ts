import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, ArrowLeft, Bell, Shield, HelpCircle, LogOut, ChevronRight, Mail, MessageSquare, User } from 'lucide-angular';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SettingsComponent,
        RouterTestingModule,
        LucideAngularModule.pick({ ArrowLeft, Bell, Shield, HelpCircle, LogOut, ChevronRight, Mail, MessageSquare, User })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
