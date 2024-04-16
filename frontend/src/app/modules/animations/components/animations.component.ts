import { Component, OnInit } from '@angular/core';
import { AttributeOption } from '../../product-models/models/model-attribute';
import { AttributeService } from '../services/attribute.service';

@Component({
  templateUrl: '../views/animations.component.html',
})
export class AnimationsComponent implements OnInit {

  public animations:AttributeOption[] = [];

  constructor(
    private attributeService:AttributeService
  ) { }

  ngOnInit(): void {
    this.attributeService.indexOptionsByTpe('animation').subscribe((animations:AttributeOption[]) => this.animations = animations);
  }

}
