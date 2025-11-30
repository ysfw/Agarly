import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestsComponent } from './requests.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, Calendar, User, Clock, Plus } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';

describe('RequestsComponent', () => {
  let component: RequestsComponent;
  let fixture: ComponentFixture<RequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RequestsComponent,
        RouterTestingModule,
        NavbarComponent,
        LucideAngularModule.pick({ Calendar, User, Clock, Plus })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
