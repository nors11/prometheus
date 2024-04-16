import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModelService } from '../../services/product-model.service';
import { ProductModel } from '../../models/product-model';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';
import { ProviderService } from 'src/app/modules/products/services/provider.service';

@Component({
    selector: 'tecneplas-product-models',
    templateUrl: '../../views/product-models/product-models.component.html',
})
export class ProductModelsComponent implements OnInit {
    
    public productModels = [];
    public subscriptions: Subscription[] = [];
    public productModelSearch: string;
    public productModel: ProductModel;
    public modalRef: NgbModalRef;
    public productTypes = [];
    public fringes = [];

    constructor(
        private router: Router,
        private productModelService: ProductModelService,
        private modalService: NgbModal,
        private toastService: ToastService,
        private providerService: ProviderService
    ) { }

    ngOnInit(): void {
        this.subscriptions['indexProductModelService'] = this.productModelService.index().subscribe((productModels: ProductModel[]) => this.productModels = productModels);

        // Get type list
        this.subscriptions['indexProductTypesProviderService'] = this.providerService.indexProductTypes().subscribe((productTypes:[]) => this.productTypes = productTypes);

        // Get fringe list
        this.subscriptions['indexFringesProviderService'] = this.providerService.indexFringes().subscribe((fringes:[]) => this.fringes = fringes);
    }

    newProductType(){
        this.router.navigate(['product-models/new']);
    }
    
    filterProductModels(productModelName:string) {
        const queryParams = (productModelName != '') ? `name=${productModelName}` : '';
        this.subscriptions['indexProductModelService'] = this.productModelService.index(queryParams).subscribe((productModels: ProductModel[]) => this.productModels = productModels);
    }

    openDeleteProductModel(deleteActionModal, productModel:ProductModel) {
        this.productModel = productModel;
        this.modalRef = this.modalService.open(deleteActionModal, { ariaLabelledBy: 'modal-basic-title' });
    }

    removeProductModel() {
        this.productModelService.delete(this.productModel._id).subscribe((res) => {
            this.modalRef.dismiss();
            this.subscriptions['indexProductModelService'] = this.productModelService.index().subscribe((productModels: ProductModel[]) => this.productModels = productModels);
            this.toastService.show(`El modelo "${this.productModel.name}" ha sido eliminado.`, { classname: 'bg-success text-white' });
        });
    }

    findProductModelTypeName(productModelType:string) {
        const productType = this.productTypes.find((item) => item.id == productModelType);
        return (productType) ? productType.name : '';
    }

    findProductModelFringeName(productModelFringe:string) {
        const fringe = this.fringes.find((item) => item.id == productModelFringe);
        return (fringe) ? fringe.name : '';
    }

    ngOnDestroy() {
        // Remove subscriptions
        for (let subscription in this.subscriptions) {
            this.subscriptions[subscription].unsubscribe();
        }
    }
}
