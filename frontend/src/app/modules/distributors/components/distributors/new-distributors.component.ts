import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../../modules/account/services/authentication.service';
import { DistributorsService } from '../../services/distributors.service';
import { Distributor } from '../../../products/models/distributor';
import { Account } from '../../../../modules/account/models/account';
import { UserService } from '../../../account/services/user.service';
 
@Component({
    selector: 'tecneplas-distributors-new',
    templateUrl: '../../views/distributors/new-distributors.component.html',
})
export class NewDistributorsComponent implements OnInit {

    public currentWizardNumber: number = 0;
    public distributorForm: UntypedFormGroup;
    public userDistributorForm: UntypedFormGroup;
    public distributor: Distributor;
    public account: Account
    
  constructor(
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private distributorsService: DistributorsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {

    this.distributorForm = this.formBuilder.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        email: ['', Validators.required],
    });

    this.userDistributorForm = this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', Validators.required],
        surname: ['', Validators.required],
        role: ['distributor', Validators.required],
        id_distributor: [''],
        status: [true]
    });

  }

    submitDistributorForm() {
        this.currentWizardNumber = this.currentWizardNumber + 1;
    }

    submitUserDistributorForm() {
        this.userService.validateEmail(this.userDistributorForm.controls['email'].value).subscribe(
            res => {
                this.distributorsService.create(this.distributorForm.value).subscribe(
                    (distributor: Distributor) => {
                        this.distributor = distributor['newDistributor'];
                        if(this.distributor && this.distributor._id) {
                            this.userDistributorForm.controls['id_distributor'].setValue(this.distributor._id);
                            this.authenticationService.register(this.userDistributorForm.value).subscribe(
                                (account: Account) => {
                                    this.account = account;
                                    this.currentWizardNumber = this.currentWizardNumber + 1;
                                },
                                error => {
                                    console.log(error)
                                }
                            );
                        }
                    },
                    error => {
                        console.log(error)
                    }
                );
            },
            error => {
                this.userDistributorForm.controls['email'].setErrors({invalidEmail: true});
            }
        )
    }

    previousCurrentWizard() {
        this.currentWizardNumber = this.currentWizardNumber - 1;
    }


}