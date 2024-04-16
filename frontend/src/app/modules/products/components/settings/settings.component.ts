import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { CrossService } from '../../services/cross.service';
import { Cross, Language } from '../../models/cross';
import { PharmacyService } from '../../services/pharmacy.service';
import { Pharmacy } from '../../models/pharmacy';
import { ProductModelService } from '../../../product-models/services/product-model.service';
import { ProductModel } from '../../../product-models/models/product-model';

@Component({
    selector: 'tecneplas-products-settings',
    templateUrl: '../../views/settings/settings.component.html',
})
export class SettingsComponent implements OnInit {

  @Input() cross: Cross;
  @Output() updatedCross = new EventEmitter();
  public temperature: any;
  public editProduct: boolean;
  public editContract: boolean;
  public productForm: UntypedFormGroup;
  public contractForm: UntypedFormGroup;
  public pharmacies: Pharmacy[];
  public productModels: ProductModel[];
  public connectivity: boolean;
  public language = Language;
    
  constructor(
    private crossService: CrossService,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private pharmacyService: PharmacyService,
    private productTypeService: ProductModelService
  ) { }

  ngOnInit(): void {
    this.editProduct = false;
    this.editContract = false;

    this.pharmacyService.index().subscribe(
      (pharmacies: Pharmacy[]) => {
        this.pharmacies = pharmacies;
      }
    );

    this.productTypeService.index().subscribe((productModels: ProductModel[]) => {
        this.productModels = productModels;
      }
    );

    this.productForm = this.formBuilder.group({
      type: [{value: '', disabled: true}, Validators.required],
      name: [{value: '', disabled: true}, Validators.required],
      number_plate: [{value: '', disabled: true}, Validators.required],
      model: [{value: '', disabled: true}, Validators.required],
      language: [{value: '', disabled: true}, Validators.required],
      connectivity: [{value: false, disabled: true}, Validators.required],
      wifiSSID: [{value: '', disabled: true}, Validators.required],
      password: [{value: '', disabled: true}]
    });

    if(this.cross.type) this.productForm.controls['type'].setValue(this.cross.type);
    if(this.cross.name) this.productForm.controls['name'].setValue(this.cross.name);
    if(this.cross.number_plate) this.productForm.controls['number_plate'].setValue(this.cross.number_plate);
    if(this.cross.model) this.productForm.controls['model'].setValue(this.cross.model);
    if(this.cross.language) this.productForm.controls['language'].setValue(this.cross.language);
    if(this.cross.connectivity) {
        this.productForm.controls['connectivity'].setValue(this.cross.connectivity);
        this.connectivity = this.cross.connectivity;
    }
    else this.connectivity = false;
    if(this.cross.wifiSSID) this.productForm.controls['wifiSSID'].setValue(this.cross.wifiSSID);
    if(this.cross.password) this.productForm.controls['password'].setValue(this.cross.password);

    this.contractForm = this.formBuilder.group({
      id_pharmacy: [{value: '', disabled: true}, Validators.required],
      contract: [{value: '', disabled: true}, Validators.required],
    });
    if(this.cross.pharmacy._id) this.contractForm.controls['id_pharmacy'].setValue(this.cross.id_pharmacy);
    if(this.cross.contract) this.contractForm.controls['contract'].setValue(this.cross.contract);
  }

  submitProductForm() {
    var updateCross = this.productForm.value;
    updateCross.id_pharmacy = this.cross.id_pharmacy;
    this.crossService.update(this.cross._id, updateCross).subscribe(
      res => {
        this.updatedCross.emit(res);
        this.toastService.show('Datos del producto actualizado.', {classname: 'bg-success text-white'});
        this.editProduct = false;
        this.toggleEditProduct();
      },
      error => {
        console.log(error)
      }
    )
  }

  submitContractForm() {
    this.crossService.update(this.cross._id, this.contractForm.value).subscribe(
      res => {
        this.toastService.show('Datos del contrato actualizado.', {classname: 'bg-success text-white'});
        this.editContract = false;
        this.toggleEditContract();
      },
      error => {
        console.log(error)
      }
    )
  }

  updateProduct() {
    if(this.editProduct == false) {
        this.editProduct = true;
        this.toggleEditProduct();
    }

  }

  updateContract() {
    if(this.editContract == false){
        this.editContract = true;
        this.toggleEditContract();
    }
  }

  toggleEditProduct(){
    if(this.editProduct){
        this.productForm.controls['type'].enable();
        this.productForm.controls['name'].enable();
        this.productForm.controls['number_plate'].enable();
        this.productForm.controls['model'].enable();
        this.productForm.controls['language'].enable();
        this.productForm.controls['connectivity'].enable();
        if(this.connectivity){
            this.productForm.controls['wifiSSID'].enable();
            this.productForm.controls['password'].enable();
        }
    } else{
        this.productForm.controls['type'].disable();
        this.productForm.controls['name'].disable();
        this.productForm.controls['number_plate'].disable();
        this.productForm.controls['model'].disable();
        this.productForm.controls['language'].disable();
        this.productForm.controls['connectivity'].disable();
        this.productForm.controls['wifiSSID'].disable();
        this.productForm.controls['password'].disable();
    }
  }
  toggleEditContract(){
    if(this.editContract){
        this.contractForm.controls['id_pharmacy'].enable();
        this.contractForm.controls['contract'].enable();
    } else{
        this.contractForm.controls['id_pharmacy'].disable();
        this.contractForm.controls['contract'].disable();
    }
  }

  toggleWifi(value){
    this.connectivity = value;
    if(value){
        this.productForm.controls['wifiSSID'].enable();
        this.productForm.controls['password'].enable();
    } else{
        this.productForm.controls['wifiSSID'].disable();
        this.productForm.controls['password'].disable();
    }
  }
}
