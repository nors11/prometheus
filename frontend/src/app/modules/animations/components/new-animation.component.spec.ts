import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAnimationComponent } from './new-animation.component';

describe('NewAnimationComponent', () => {
  let component: NewAnimationComponent;
  let fixture: ComponentFixture<NewAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAnimationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
