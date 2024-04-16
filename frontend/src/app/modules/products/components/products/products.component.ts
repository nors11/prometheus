import { Component, Input, OnInit } from '@angular/core';
import { CrossService } from '../../services/cross.service';
import { Distributor } from '../../models/distributor';
import { DistributorService } from '../../services/distributor.service';
import { Router } from '@angular/router';
import { Account, UserRole } from 'src/app/modules/account/models/account';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Cross } from '../../models/cross';
import { ToastService } from 'src/app/services/toast.service';

@Component({
    selector: 'tecneplas-products',
    templateUrl: '../../views/products/products.component.html',
})
export class ProductsComponent implements OnInit {

    @Input() pharmacy;
    public crosses = [];
    public crossNumber = 0;
    public distributors: Distributor;
    public model: any;
    public user: Account;
    public userRole = UserRole;
    public interval;
    public subscriptions: Subscription[] = [];
    public modalRef: NgbModalRef;
    public cross: Cross;

    constructor(
        private router: Router,
        private crossService: CrossService,
        private distributorService: DistributorService,
        private authenticationService: AuthenticationService,
        private toastService: ToastService,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        this.user = this.authenticationService.currentAccountValue;
        this.getCrosses();
    }
    getCrosses(){
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.pharmacy) {
            this.getPharmacyCrosses();
            this.interval = setInterval(() => {
                this.getPharmacyCrosses();
            }, 5000);
        }
        else {
            if(this.user.role == this.userRole.admin){
                this.getAdminCrosses();
                this.interval = setInterval(() => {
                    this.getAdminCrosses();
                }, 5000);
                
                this.distributorService.index().subscribe((distributors: Distributor) => this.distributors = distributors);
            }
            else if(this.user.role == this.userRole.distributor){
                this.getDistributorCrosses();
                this.interval = setInterval(() => {
                    this.getDistributorCrosses();
                }, 5000);
            }
        }
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    getAdminCrosses(newValue?){
        if(newValue) this.model = newValue;
        this.subscriptions['indexCrossService'] = this.crossService.index(this.model).subscribe((crosses) => this.crosses = crosses);
        this.subscriptions['countCrossService'] = this.crossService.count().subscribe((crossNumber) => this.crossNumber = crossNumber);
    }
    getDistributorCrosses(newValue?){
        if(newValue) this.model = newValue;
        this.subscriptions['indexByDistributorCrossService'] = this.crossService.indexByDistributor(this.user.id_distributor, this.model).subscribe((crosses) => this.crosses = crosses); 
        this.subscriptions['countByDistributorCrossService'] = this.crossService.countByDistributor(this.user.id_distributor).subscribe((crossNumber) => this.crossNumber = crossNumber);
    }
    getPharmacyCrosses(newValue?){
        if(newValue) this.model = newValue;
        this.subscriptions['indexByPharmacyCrossService'] = this.crossService.indexByPharmacy(this.pharmacy._id, this.model).subscribe((crosses) => this.crosses = crosses);
        this.subscriptions['countByPharmacyCrossService'] = this.crossService.countByPharmacy(this.pharmacy._id).subscribe((crossNumber) => this.crossNumber = crossNumber)
    }
    //Revise for roles ^
    valuechange(newValue) {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.pharmacy) {
            this.getPharmacyCrosses(newValue);
            this.interval = setInterval(() => {
                this.getPharmacyCrosses(newValue);
            }, 5000);
        }
        else {
            if(this.user.role == this.userRole.admin){
                this.getAdminCrosses(newValue);
                this.interval = setInterval(() => {
                    this.getAdminCrosses(newValue);
                }, 5000);
                
                this.distributorService.index().subscribe((distributors: Distributor) => this.distributors = distributors);
            }
            else if(this.user.role == this.userRole.distributor){
                this.getDistributorCrosses(newValue);
                this.interval = setInterval(() => {
                    this.getDistributorCrosses(newValue);
                }, 5000);
            }
        }
    }

    newProduct() {
        if (this.pharmacy) {
            this.router.navigate(['products/new'], { queryParams: { pharmacy: this.pharmacy._id } });
        }
        else {
            this.router.navigate(['products/new']);
        }
    }
    openRemoveCross(deleteActionModal, cross){
        this.modalRef = this.modalService.open(deleteActionModal, { ariaLabelledBy: 'modal-basic-title' });
        this.cross = cross;
    }
    
    removeCross() {
        this.crossService.delete(this.cross['_id']).subscribe(
            res => {
                this.modalRef.dismiss();
                this.getCrosses()
                this.toastService.show(`El producto ${this.cross.name} ha sido eliminado.`, { classname: 'bg-success text-white' });
            }
        )
    }

}
