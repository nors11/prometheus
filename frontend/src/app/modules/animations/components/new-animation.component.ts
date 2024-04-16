import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { AttributeService } from '../services/attribute.service';

@Component({
  templateUrl: '../views/new-animation.component.html',
})
export class NewAnimationComponent implements OnInit {

  public animationForm:UntypedFormGroup;

  constructor(
    private formBuilder:FormBuilder,
    private router: Router,
    private attributeService:AttributeService,
    private toastService:ToastService
  ) { }

  ngOnInit(): void {
    this.animationForm = this.formBuilder.group({
      name: ['', Validators.required],
      animation: ['', Validators.required],
      animationSource: ['', Validators.required]
    });
  }

  submitAnimationForm() {
    if(this.animationForm.valid) {            
      const animationParams = new FormData();
      animationParams.append('name', this.animationForm.get('name').value)
      animationParams.append('file', this.animationForm.get('animationSource').value);

      this.attributeService.createAttributeOptionByType('animation', animationParams).subscribe(
        () => {
          this.toastService.show('Animación creada correctamente', { classname: 'bg-success text-white' });
          this.router.navigate(['animations']);
        },
        (error) => {
          console.log(error);
        }
      );
      console.log(animationParams);
    }        
  }

  onChangeAnimation(event) {
    if (event.target.files && event.target.files[0]) {
      this.animationForm.patchValue({ animationSource: event.target.files[0] });
    }
  }

}
