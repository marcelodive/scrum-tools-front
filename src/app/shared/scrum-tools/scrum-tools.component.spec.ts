import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrumToolsComponent } from './scrum-tools.component';

describe('ScrumToolsComponent', () => {
  let component: ScrumToolsComponent;
  let fixture: ComponentFixture<ScrumToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrumToolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrumToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
