import { Component, OnInit, ViewChild } from '@angular/core';
import { PharmacyService } from '../../services/pharmacy.service';
import { Pharmacy } from '../../../products/models/pharmacy';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import { Account, UserRole } from 'src/app/modules/account/models/account';

@Component({
    selector: 'tecneplas-pharmacy',
    templateUrl: '../../views/pharmacy/pharmacy.component.html',
})
export class PharmacyComponent implements OnInit {

    public pharmacyId: string
    public pharmacy: Pharmacy;
    public activeTabPharmacy = 'team';
    public user: Account;
    public model: any;
    public userRole = UserRole;
    public tab = null;

    @ViewChild('nav') nav;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private pharmacyService: PharmacyService,
        private authenticationService: AuthenticationService
    ) { }

    ngOnInit(): void {
        this.user = this.authenticationService.currentAccountValue;
        this.activatedRoute.params.subscribe((params) => {
            this.pharmacyId = params.id_pharmacy;
            this.pharmacyService.view(this.pharmacyId).subscribe(
                (pharmacy: Pharmacy) => {
                    this.pharmacy = pharmacy['pharmacy'];
                }
            )
        });
    }

    ngAfterViewInit() {
        var savedTab = localStorage.getItem('activeTabPharmacy');
        if (savedTab) {
            setTimeout(() => {
                this.nav.select(savedTab);
            });
        }
    }

    saveTab(tab) {
        localStorage.setItem('activeTabPharmacy', tab);
    }

    logout(): void {
        this.authenticationService.logout();
    }

    newProduct(){
        this.router.navigate(['/products/new'], { state: { pharmacy: this.pharmacyId } });
    }
}