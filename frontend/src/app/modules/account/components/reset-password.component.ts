import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { PasswordService } from '../services/password.service';

@Component({
  templateUrl: '../views/reset-password.component.html',
  styleUrls: ['../css/login.component.scss']
})
export class ResetPasswordComponent implements OnInit {

    public formGroup: UntypedFormGroup;
    public token: string;
    public successMessage: string;
    public errorMessage: string;

    constructor(
      private formBuilder: UntypedFormBuilder,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private passwordService: PasswordService
    ) {}

    ngOnInit(): void {
      this.token = this.activatedRoute.snapshot.params.token;
      this.buildForm();
    }

    buildForm(): void {
      this.formGroup = this.formBuilder.group({
        email: ['', Validators.email],
        password: ['', Validators.required],
        token: [this.token],
      });
    }

    submitForm(): void{
      this.passwordService.resetPassword(this.formGroup.value).subscribe(
        resetPassword => {
          const navigationExtras: NavigationExtras = {
            state: {
              resetPasssword: resetPassword.message
            }
          };
          this.router.navigate(['account/login'], navigationExtras);
        },
        error => {
          this.errorMessage = error.message;
        }
      );
    }
}
