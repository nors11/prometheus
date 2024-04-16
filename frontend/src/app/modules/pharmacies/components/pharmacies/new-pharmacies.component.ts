import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { merge, Observable, OperatorFunction, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { DistributorsService } from '../../../distributors/services/distributors.service';
import { Distributor } from '../../../products/models/distributor';
import { PharmacyService } from '../../services/pharmacy.service';
import { Pharmacy } from '../../../products/models/pharmacy';
import { AuthenticationService } from '../../../../modules/account/services/authentication.service';
import { Account, UserRole } from '../../../account/models/account';
import { UserService } from '../../../../modules/account/services/user.service';
 
@Component({
    selector: 'tecneplas-pharmacies',
    templateUrl: '../../views/pharmacies/new-pharmacies.component.html',
})
export class NewPharmaciesComponent implements OnInit {

    @ViewChild('instance', {static: false}) instance: NgbTypeahead;
    focus$ = new Subject<string>();
    click$ = new Subject<string>();

    public currentWizardNumber: number = 0;
    public generalForm: UntypedFormGroup;
    public addressForm: UntypedFormGroup;
    public contactForm: UntypedFormGroup;
    public distributorForm: UntypedFormGroup;
    public pharmacyAddressInfo: string;
    public model: Distributor;
    public distributors: Distributor[];
    public pharmacy: Pharmacy;
    public account: Account;
    public user: Account;
    public userRole = UserRole;
    
    constructor(
        private formBuilder: UntypedFormBuilder,
        private distributorsService: DistributorsService,
        private pharmacyService: PharmacyService,
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.user = this.authenticationService.currentAccountValue;
        this.generalForm = this.formBuilder.group({
            name: ['', Validators.required],
            nif: ['', Validators.required],
            id_pharmacy: ['']
        });

        this.addressForm = this.formBuilder.group({
            street_name: ['', Validators.required],
            number: ['', Validators.required],
            zip: ['', Validators.required],
            city: ['', Validators.required],
        });

        this.contactForm = this.formBuilder.group({
            email: ['', Validators.required],
            phone: ['', Validators.required],
        });

        this.distributorForm = this.formBuilder.group({
            id_distributor: ['', Validators.required]
        });

        this.distributorsService.index().subscribe(
            (distributors: Distributor[]) => {
                this.distributors = distributors;
            },
            error => {
                console.log(error)
            }
        )
    }

    previousCurrentWizard() {
        this.currentWizardNumber = this.currentWizardNumber - 1;
    }

    submitGeneralForm() {
      this.currentWizardNumber = this.currentWizardNumber + 1;
    }

    submitAddressForm() {
        this.currentWizardNumber = this.currentWizardNumber + 1;
        this.pharmacyAddressInfo = `${this.addressForm.controls['street_name'].value} ${this.addressForm.controls['number'].value}, ${this.addressForm.controls['zip'].value} ${this.addressForm.controls['city'].value}`
    }

    submitContactForm() {
        this.userService.validateEmail(this.contactForm.controls['email'].value).subscribe(
            res => {
                if(this.user.role == this.userRole.distributor){
                    const params = {
                        name: this.generalForm.controls['name'].value,
                        nif: this.generalForm.controls['nif'].value,
                        email: this.contactForm.controls['email'].value,
                        phone: this.contactForm.controls['phone'].value,
                        id_distributor: this.user.id_distributor,
                        address: {
                            street_name: this.addressForm.controls['street_name'].value,
                            number: this.addressForm.controls['number'].value,
                            zip: this.addressForm.controls['zip'].value,
                            city: this.addressForm.controls['city'].value
                        }
                    }
                    this.createPharmacy(params);
                }
                else{
                    this.currentWizardNumber = this.currentWizardNumber + 1;
                }
            },
            error => {
                this.contactForm.controls['email'].setErrors({invalidEmail: true});
            }
        );
    }

    submitDistributorForm() {
        const params = {
            name: this.generalForm.controls['name'].value,
            nif: this.generalForm.controls['nif'].value,
            email: this.contactForm.controls['email'].value,
            phone: this.contactForm.controls['phone'].value,
            id_distributor: this.distributorForm.value['id_distributor']._id,
            address: {
                street_name: this.addressForm.controls['street_name'].value,
                number: this.addressForm.controls['number'].value,
                zip: this.addressForm.controls['zip'].value,
                city: this.addressForm.controls['city'].value
            }
        }
        this.createPharmacy(params);   
    }

    createPharmacy(params){
        this.pharmacyService.create(params).subscribe(
            (pharmacy: Pharmacy) => {
                this.pharmacy = pharmacy['newPharmacy'];
                if(this.pharmacy && this.pharmacy._id) {
                    this.generalForm.controls['id_pharmacy'].setValue(this.pharmacy._id);

                    const params = {
                        name: this.generalForm.controls['name'].value,
                        email: this.contactForm.controls['email'].value,
                        role: 'pharmacy',
                        id_pharmacy: this.pharmacy._id,
                        status: true
                    }

                    this.authenticationService.register(params).subscribe(
                        (account: Account) => {
                            this.account = account;
                            if(this.user.role == this.userRole.distributor)this.currentWizardNumber = this.currentWizardNumber + 2;
                            else this.currentWizardNumber = this.currentWizardNumber + 1;
                        },
                        error => {
                            console.log(error)
                        }
                    );
                }
            }
        )
    }

    formatter = (distributor: Distributor) => distributor.name;

    search: OperatorFunction<string, readonly {_id, name}[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
        const inputFocus$ = this.focus$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => this.distributors.filter(distributor => new RegExp(term, 'mi').test(distributor.name)).slice(0, 10))
        );

    }

}