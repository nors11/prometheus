import { Component, OnInit } from '@angular/core';
import { PharmacyService } from '../../services/pharmacy.service';
import { Pharmacy } from '../../../products/models/pharmacy';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import { Account, UserRole } from 'src/app/modules/account/models/account';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';

@Component({
    selector: 'tecneplas-pharmacies',
    templateUrl: '../../views/pharmacies/pharmacies.component.html',
})
export class PharmaciesComponent implements OnInit {

    public pharmacies: Pharmacy[];
    public pharmaciesCount: number;
    public model: any;
    public user: Account;
    public userRole = UserRole;
    public subscriptions: Subscription[] = [];
    public modalRef: NgbModalRef;
    public pharmacy: Pharmacy;

    constructor(
        private router: Router,
        private pharmacyService: PharmacyService,
        private authenticationService: AuthenticationService,
        private toastService: ToastService,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        this.user = this.authenticationService.currentAccountValue;
        this.getPharmacies();
    }
    getPharmacies(){
        if(this.user.role == this.userRole.admin){
            this.subscriptions['indexPharmacyService'] = this.pharmacyService.index().subscribe((pharmacies: Pharmacy[]) => this.pharmacies = pharmacies);
            this.subscriptions['countPharmacyService'] = this.pharmacyService.count().subscribe((pharmaciesCount: number) => this.pharmaciesCount = pharmaciesCount);
        }
        else if(this.user.role == this.userRole.distributor){
            this.subscriptions['indexPharmacyService'] = this.pharmacyService.indexByDistributor(this.user.id_distributor).subscribe((pharmacies: Pharmacy[]) => this.pharmacies = pharmacies)
            this.subscriptions['countPharmacyService'] = this.pharmacyService.count().subscribe((pharmaciesCount: number) => this.pharmaciesCount = pharmaciesCount);
        }
    }
    
    ngOnDestroy() {
        // Remove subscriptions
        for (let subscription in this.subscriptions) {
            this.subscriptions[subscription].unsubscribe();
        }
    }

    valuechange(newValue) {
        this.model = newValue;
        this.subscriptions['indexPharmacyService'] = this.pharmacyService.index(this.model).subscribe((pharmacies: Pharmacy[]) => this.pharmacies = pharmacies)
        this.subscriptions['countPharmacyService'] = this.pharmacyService.count().subscribe((pharmaciesCount: number) => this.pharmaciesCount = pharmaciesCount);
    }

    navToProducts(pharmacy){
        localStorage.setItem('activeTabPharmacy', 'products');
        this.router.navigate(['pharmacy/'+ pharmacy._id]);
    }

    navToTeam(pharmacy){
        localStorage.setItem('activeTabPharmacy', 'team');
        this.router.navigate(['pharmacy/'+ pharmacy._id]);
    }

    openRemovePharmacy(deleteActionModal, pharmacy){
        this.modalRef = this.modalService.open(deleteActionModal, { ariaLabelledBy: 'modal-basic-title' });
        this.pharmacy = pharmacy;
    }
    
    removePharmacy() {
        this.pharmacyService.remove(this.pharmacy['_id']).subscribe(
            res => {
                this.modalRef.dismiss();
                this.getPharmacies()
                this.toastService.show(`${this.pharmacy.name} ha sido eliminada.`, { classname: 'bg-success text-white' });
            }
        )
    }

}