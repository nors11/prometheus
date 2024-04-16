import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PharmacyService } from '../../services/pharmacy.service';
import { Pharmacy } from '../../models/pharmacy';
import { ServiceService } from '../../services/service.services';
import { Service } from '../../models/service';
import { CrossService } from '../../services/cross.service';
import { Cross, Language } from '../../models/cross';
import { Account, UserRole } from 'src/app/modules/account/models/account';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import { ProductModelService } from '../../../product-models/services/product-model.service';
import { ProductModel } from '../../../product-models/models/product-model';
import { ToastService } from 'src/app/services/toast.service';
import { ProviderService } from '../../services/provider.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'tecneplas-new-product',
    templateUrl: '../../views/products/new-product.component.html',
})
export class NewProductComponent implements OnInit {

    public currentWizardNumber: number = 0;
    public currentContractType:string;
    public productForm: UntypedFormGroup;
    public contractForm: UntypedFormGroup;
    public serviceForm: UntypedFormGroup;

    public productModels: ProductModel[];
    public pharmacies: Pharmacy[];
    public services: Service[];
    public modelServices: Service[];
    public pushServices = [];
    public messageError = [];
    public newCross;
    public showErrorsNewProduct = {};
    public showErrorsContract = {};
    public user: Account;
    public userRole = UserRole;
    public pharmacy = null;
    public language = Language;
    public subscriptions: Subscription[] = [];
    public productTypes = [];
    public selectedModel: ProductModel;
    public ssidRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private pharmacyService: PharmacyService,
        private serviceService: ServiceService,
        private crossService: CrossService,
        private authenticationService: AuthenticationService,
        private toastService: ToastService,
        private productModelService: ProductModelService,
        private providerService: ProviderService
    ) { 
        this.activatedRoute.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.pharmacy = this.router.getCurrentNavigation().extras.state.pharmacy;
            }
        });
    }

    ngOnInit(): void {
        this.user = this.authenticationService.currentAccountValue;
        this.productModelService.index().subscribe((productModels: ProductModel[]) => {
                this.productModels = productModels;
            }
        );

        this.productForm = this.formBuilder.group({
            type: ['', Validators.required],
            name: ['', Validators.required],
            ssid: ['', Validators.pattern(this.ssidRegex)],
            number_plate: ['', Validators.required],
            model: [null, Validators.required],
            connectivity: [true, Validators.required],
            wifiSSID: ['', Validators.required],
            password: [''],
            language: [this.language.es, Validators.required]
        });
        
        this.subscriptions['indexProductTypesProviderService'] = this.providerService.indexProductTypes().subscribe((productTypes:[]) => {
            this.productTypes = productTypes
            this.productForm.get('type').setValue(this.productTypes.find(productType => productType.id === 'cross').id);
        });
        
        this.contractForm = this.formBuilder.group({
            id_pharmacy: [null, Validators.required],
            contract: ['', Validators.required],
        });
        if(this.pharmacy){
            this.contractForm.controls['id_pharmacy'].setValue(this.pharmacy);
        }

        this.serviceForm = this.formBuilder.group({
            online_services: [''],
        });

        this.pharmacyService.index().subscribe((pharmacies: Pharmacy[]) => {this.pharmacies = pharmacies});
        this.serviceService.indexOnline().subscribe((services:Service[]) => {this.services = services});
    }

    submitProductForm() {
        this.crossService.getNumberPlate(this.productForm.controls['number_plate'].value).subscribe(
            res => {
                this.crossService.getSsid(this.productForm.controls['ssid'].value).subscribe(
                    res => {
                        if(this.productForm.valid) this.currentWizardNumber = this.currentWizardNumber + 1;
                    },
                    error => {
                        this.productForm.controls['ssid'].setErrors({invalidSsid: true})
                    }
                );
            },
            error => {
                this.productForm.controls['number_plate'].setErrors({invalidNumberPlate: true})
            }
        );

        this.selectedModel = this.productModels.find(model => model._id === this.productForm.controls.model.getRawValue());
        this.modelServices = this.services.filter((s => this.selectedModel.online_services.find((os => os._id.toString() === s._id.toString()))));
    }

    submitContractForm() {
        this.currentWizardNumber = this.currentWizardNumber + 1;
    }

    submitServiceForm() {
        this.services.forEach(element => {
            if(element['status'] === 'active'){
                let service = new Service();
                service.name = element.name;
                service['id_service'] = element._id;
                service['value'] = null;
                service['active'] = true;

                this.pushServices.push(service);
            }
        });
        this.serviceForm.controls['online_services'].setValue(this.pushServices);

        const params = {
            type: this.productForm.controls['type'].value,
            name: this.productForm.controls['name'].value,
            ssid: this.productForm.controls['ssid'].value.toLowerCase(),
            number_plate: this.productForm.controls['number_plate'].value,
            model: this.productForm.controls['model'].value,
            connectivity: this.productForm.controls['connectivity'].value,
            wifiSSID: this.productForm.controls['connectivity'].value == true ? this.productForm.controls['wifiSSID'].value: '',
            password: this.productForm.controls['connectivity'].value == true ? this.productForm.controls['password'].value: '',
            language: this.productForm.controls['language'].value,
            id_pharmacy: this.contractForm.controls['id_pharmacy'].value,
            contract: this.contractForm.controls['contract'].value,
            online_services: this.serviceForm.controls['online_services'].value
        }

        this.crossService.create(params).subscribe(
            (cross:Cross[]) => {
                this.newCross = cross;
                this.currentWizardNumber = this.currentWizardNumber + 1;
            },
            error => {
                this.toastService.show(error.message, { classname: 'bg-danger text-white' });
                this.serviceForm.controls['online_services'].setValue(['']);
                this.pushServices = [];
            }
        );
    }

    contratType(contract:string) {
        this.currentContractType = contract;
        this.contractForm.controls['contract'].setValue(contract);
    }

    previousCurrentWizard() {
        this.currentWizardNumber = this.currentWizardNumber - 1;
    }

    addService(service) {
        this.services.forEach((element, index) => {
            if(element._id === service._id) {
                if(this.services[index]['status'] == 'active') this.services[index]['status'] = null;
                else this.services[index]['status'] = 'active';
            }
        });
    }

    navToProducts(){
        localStorage.setItem('activeTabPharmacy', 'products');
        this.router.navigate(['pharmacy/'+ this.pharmacy]);
    }

    toggleWifi(value){
        if(value){
            this.productForm.controls['wifiSSID'].enable();
            this.productForm.controls['password'].enable();
        }else{
            this.productForm.controls['wifiSSID'].disable();
            this.productForm.controls['password'].disable();
        }
    }
}