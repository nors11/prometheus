import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { UserRole } from '../models/account';

@Component({
    templateUrl: '../views/login.component.html',
    styleUrls: ['../css/login.component.scss']
})
export class LoginComponent implements OnInit {

    public formGroup: UntypedFormGroup;
    public errors: string;
    public returnUrl: string;
    public resetPasssword: string;
    public userRole = UserRole;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private authenticationService: AuthenticationService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        if (this.authenticationService.currentAccountValue) {
            if (this.authenticationService.currentAccountValue.role) {
                if(this.authenticationService.currentAccountValue.role == this.userRole.pharmacy){
                    this.router.navigate(['pharmacy/'+ this.authenticationService.currentAccountValue.id_pharmacy]);
                }
                else{
                    this.router.navigate(['products']);
                }
            }
        }
        this.activatedRoute.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.resetPasssword = this.router.getCurrentNavigation().extras.state.resetPasssword;
            }
        });
    }

    ngOnInit(): void {
        this.buildForm();
        this.returnUrl = (this.activatedRoute.snapshot.queryParams.returnUrl && this.activatedRoute.snapshot.queryParams.returnUrl != '/') ? this.activatedRoute.snapshot.queryParams.returnUrl : 'products';
    }

    buildForm(): void {
        this.formGroup = this.formBuilder.group({
            email: ['', Validators.required],
            pass: ['', Validators.required],
        });
    }

    submitForm(): void {
        this.authenticationService.login(this.formGroup.value)
            .pipe(first())
            .subscribe(
                (res) => {
                    // login successful so redirect to return url
                    if(res.role == this.userRole.pharmacy){
                        this.router.navigate(['pharmacy/'+ res.id_pharmacy]);
                    }
                    else{
                        this.router.navigate([this.returnUrl]);
                    }
                },
                (error) => {
                    this.errors = error;
                }
            );
    }
}
