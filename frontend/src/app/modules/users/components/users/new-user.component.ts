import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../../modules/account/services/authentication.service';
import { DistributorsService } from '../../../distributors/services/distributors.service';
import { Distributor } from '../../../products/models/distributor';
import { Account, UserRole } from '../../../../modules/account/models/account';
import { Pharmacy } from 'src/app/modules/products/models/pharmacy';
import { PharmacyService } from 'src/app/modules/pharmacies/services/pharmacy.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'tecneplas-users-new',
    templateUrl: '../../views/users/new-user.component.html',
})
export class NewUserComponent implements OnInit {

    public pharmacy: string;
    public currentWizardNumber: number = 0;
    public userRoleForm: UntypedFormGroup;
    public newUserForm: UntypedFormGroup;
    public distributors: Distributor[];
    public pharmacies: Pharmacy[];
    public account: Account;
    public user: Account;
    public userRole = UserRole;
    public newUserFormSubmitted = false;
    public modalRef: NgbModalRef;
    public errorMessage;
    @ViewChild('errorsModal', { static: false }) private errorsModal;
    public loading:boolean;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private activatedRoute: ActivatedRoute,
        private authenticationService: AuthenticationService,
        private distributorsService: DistributorsService,
        private modalService: NgbModal,
        private pharmacyService: PharmacyService
    ) { }

    ngOnInit(): void {
        this.user = this.authenticationService.currentAccountValue;
        this.activatedRoute.queryParams.subscribe(params => {
            if(params.pharmacy){
                this.pharmacy = params.pharmacy;
            }
        });

        this.userRoleForm = this.formBuilder.group({
            role: ['', Validators.required],
            distributor: [{ value: '', disabled: true }, Validators.required],
            pharmacy: [{ value: '', disabled: true }, Validators.required],
        });

        this.newUserForm = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            surname: ['', Validators.required],
            role: [''],
            id_distributor: [''],
            id_pharmacy: [''],
            status: [true]
        });

        this.distributorsService.index().subscribe(
            (distributors: Distributor[]) => {
                this.distributors = distributors;
            }
        );

        this.pharmacyService.index().subscribe(
            (pharmacies: Pharmacy[]) => {
                this.pharmacies = pharmacies;
            }
        );

    }
    changeRole() {
        if (this.f.role.value == this.userRole.distributor) {
            this.f.distributor.enable();
        }
        else {
            this.f.distributor.disable();
            this.f.distributor.setValue('');
        }
        if (this.f.role.value == this.userRole.pharmacy) {
            this.f.pharmacy.enable();
        }
        else {
            this.f.pharmacy.disable();
            this.f.pharmacy.setValue('');
        }
        if (this.f.role.value == this.userRole.admin) {
            this.f.distributor.disable();
            this.f.distributor.setValue('');
            this.f.pharmacy.disable();
            this.f.pharmacy.setValue('');
        }
    }

    get f() { return this.userRoleForm.controls; }
    get fu() { return this.newUserForm.controls; }

    submitUserRoleForm() {
        if (this.f.role.value == this.userRole.distributor) {
            this.fu.id_distributor.setValue(this.f.distributor.value);
            this.newUserForm.get('id_pharmacy').disable();
        }
        else if (this.f.role.value == this.userRole.pharmacy) {
            this.fu.id_pharmacy.setValue(this.f.pharmacy.value);
            this.newUserForm.get('id_distributor').disable();
        }
        else{
            this.newUserForm.get('id_pharmacy').disable();
            this.newUserForm.get('id_distributor').disable();
        }
        this.fu.role.setValue(this.f.role.value);

        this.saveUser();
    }

    submitUserDistributorForm() {
        if(this.pharmacy){
            this.fu.role.setValue(this.userRole.pharmacy);
            this.fu.id_pharmacy.setValue(this.pharmacy);
            this.newUserForm.get('id_distributor').disable();
            this.saveUser();
        }
        else{
            this.currentWizardNumber = this.currentWizardNumber + 1;
        }
    }

    saveUser(){
        this.loading = true;
        this.authenticationService.register(this.newUserForm.value).subscribe(
            (account: Account) => {
                this.loading = false;
                this.account = account;
                if(this.pharmacy){
                    this.currentWizardNumber = this.currentWizardNumber + 2;
                }else{
                    this.currentWizardNumber = this.currentWizardNumber + 1;
                } 
            },
            error => {
                this.loading = false;
                this.errorMessage = error.message;
                this.openErrorsModal();
            }
        );
    }

    openErrorsModal() {
        this.modalRef = this.modalService.open(this.errorsModal, { ariaLabelledBy: 'modal-basic-title', size: 'md' });
    }

    previousCurrentWizard() {
        this.currentWizardNumber = this.currentWizardNumber - 1;
    }
}