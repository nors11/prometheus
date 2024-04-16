import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceSimulatorComponent } from './sequence-simulator.component';

describe('SequenceSimulatorComponent', () => {
  let component: SequenceSimulatorComponent;
  let fixture: ComponentFixture<SequenceSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequenceSimulatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SequenceSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
