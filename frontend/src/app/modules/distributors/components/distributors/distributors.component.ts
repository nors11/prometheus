import { Component, OnInit } from '@angular/core';
import { DistributorsService } from'../../services/distributors.service';
import { Distributor } from '../../../products/models/distributor';
import { ToastService } from 'src/app/services/toast.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
 
@Component({
    selector: 'tecneplas-products',
    templateUrl: '../../views/distributors/distributors.component.html',
})
export class DistributorsComponent implements OnInit {
    
  public distributors: Distributor[] = [];
  public modalRef: NgbModalRef;
  public distributor: Distributor;
  public productModel: any;
  public distributorsCount: number;

  constructor(
    private distributorsService: DistributorsService,
    private toastService: ToastService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.getDistributors();

    this.distributorsService.count().subscribe((distributorsCount: number) => this.distributorsCount = distributorsCount);
  }

  getDistributors() {
    this.distributorsService.index().subscribe((distributors: Distributor[]) => this.distributors = distributors);
  }

  switchStatus(target: Boolean, distributor: Distributor) {
    this.distributorsService.update({status: target}, distributor._id).subscribe(
      (distributor: Distributor) => {
        this.toastService.show('Estado del distribuidor actualizado', {classname: 'bg-success text-white'});
      },
      error => {
        console.log(error)
      }
    );
  }

  openRemoveDistributor(deleteActionModal, distributor: Distributor) {
    this.modalRef = this.modalService.open(deleteActionModal, { ariaLabelledBy: 'modal-basic-title' });
    this.distributor = distributor;
  }

  removeDistributor() {
    this.distributorsService.remove(this.distributor._id).subscribe(
      res => {
        this.modalRef.dismiss();
        this.toastService.show('Distribuidor eliminado', {classname: 'bg-success text-white'});
        this.getDistributors();
      },
      error => {
        this.modalRef.dismiss();
        this.toastService.show('El distribuidor no se ha podido eliminar', {classname: 'bg-danger text-white'});
      }
    )
  }
  
  valuechange(newValue) {
    this.productModel = newValue;
    this.distributorsService.index(this.productModel).subscribe((distributors) => this.distributors = distributors);
    this.distributorsService.count().subscribe((distributorsCount: number) => this.distributorsCount = distributorsCount);
  }

}
