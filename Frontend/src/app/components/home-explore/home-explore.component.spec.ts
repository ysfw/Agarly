import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeExploreComponent } from './home-explore.component';

describe('HomeExploreComponent', () => {
  let component: HomeExploreComponent;
  let fixture: ComponentFixture<HomeExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeExploreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
