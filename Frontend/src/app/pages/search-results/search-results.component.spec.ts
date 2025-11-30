import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultsComponent } from './search-results.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LucideAngularModule, ArrowLeft, SlidersHorizontal } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ItemCardComponent } from '../../components/item-card/item-card.component';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SearchResultsComponent,
        RouterTestingModule,
        FormsModule,
        ItemCardComponent,
        LucideAngularModule.pick({ ArrowLeft, SlidersHorizontal })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
