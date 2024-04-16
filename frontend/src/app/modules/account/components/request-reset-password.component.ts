import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordService } from '../services/password.service';

@Component({
  templateUrl: '../views/request-reset-password.component.html',
  styleUrls: ['../css/login.component.scss']
})
export class RequestResetPasswordComponent implements OnInit {

    public formGroup: UntypedFormGroup;
    public successMessage: string;
    public errorMessage: string;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private passwordService: PasswordService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm(): void {
        this.formGroup = this.formBuilder.group({
            email: ['', Validators.required]
        });
    }

    submitForm(): void {
        this.passwordService.forgotPassword(this.formGroup.value).subscribe(
            forgotPassword => {
                if (forgotPassword) {
                    this.errorMessage = '';
                    this.successMessage = forgotPassword.message;
                    this.router.navigate(['/account/send-request-reset-password']);
                }
            },
            error => {
                this.successMessage = '';
                this.errorMessage = error.message;
            }
        );
    }

}
