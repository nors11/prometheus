import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { Cross } from '../../models/cross';
import { CrossService } from '../../services/cross.service';
import { TimezoneService } from '../../services/timezone.service';
import { Timezone } from '../../models/timezone';
import { Settings } from '../../models/settings';
import { Service, Type } from '../../models/service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ServiceService } from '../../services/service.services';
import { Account, UserRole } from 'src/app/modules/account/models/account';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import { ProductModelService } from 'src/app/modules/product-models/services/product-model.service';

@Component({
    selector: 'tecneplas-products-services',
    templateUrl: '../../views/services/services.component.html',
})
export class ServicesComponent implements OnInit, AfterViewInit {

    @Input() cross: Cross;
    public offsetForm: UntypedFormGroup;
    public brightnessForm: UntypedFormGroup;
    public valueBrightness: [];
    public brightness: UntypedFormArray;
    public timeForm: UntypedFormGroup;
    public duplicatedBrightness: boolean = false;
    public timezones: Timezone[];
    public activeTab = 'offline';
    public type = Type;
    public modalRef: NgbModalRef;
    public services: Service[];
    public offlineServices: Service[];
    public pushServices = [];
    public serviceForm: UntypedFormGroup;
    public offlineServiceForm: UntypedFormGroup;
    public userRole = UserRole;
    public currentAccount: Account;
    
    @ViewChild('nav') nav;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private crossService: CrossService,
        private toastService: ToastService,
        private timezoneService: TimezoneService,
        private modalService: NgbModal,
        private serviceService: ServiceService,
        private authenticationService: AuthenticationService,
        private productModelService: ProductModelService
    ) { }

    ngOnInit(): void {
        this.currentAccount = this.authenticationService.currentAccountValue;
        this.serviceForm = this.formBuilder.group({
            online_services: ['']
        });
        this.offlineServiceForm = this.formBuilder.group({
            offline_services: ['']
        });
        
        this.initServices();
        this.offsetForm = this.formBuilder.group({
            temperature: [null, Validators.required],
        });
        if (this.cross.settings && this.cross.settings.temperature) this.offsetForm.controls['temperature'].setValue(this.cross.settings.temperature);

        this.timezoneService.index().subscribe(
            (timezones: Timezone[]) => {
              this.timezones = timezones['timezones'];
            }
        );

        this.timeForm = this.formBuilder.group({
            timezone: [null, Validators.required],
        });
        if(this.cross.settings && this.cross.settings.timezone) this.timeForm.controls['timezone'].setValue(this.cross.settings.timezone);

        if(!this.cross.settings || !this.cross.settings.brightness || Object.keys(this.cross.settings.brightness).length == 0) {
            this.brightnessForm = this.formBuilder.group({
                brightness: this.formBuilder.array([this.createBrightness()])
            });
        }else {
            this.brightnessForm = this.formBuilder.group({
                brightness: this.formBuilder.array([])
            });

            this.cross.settings.brightness.forEach(element => {
                const newBrightness = this.formBuilder.group({
                    light: [element['light'], Validators.required],
                    brightness: [element['brightness'], Validators.required],
                });
                this.addBrightness(newBrightness)
            });
        }

        this.valueBrightness = this.brightnessForm.controls['brightness'].value;
        this.brightnessForm.valueChanges.subscribe(() => {
            this.valueBrightness = this.brightnessForm.controls['brightness'].value;
        });
    }
    ngAfterViewInit() {
        this.nav.select(this.activeTab);
    }
    initServices(){
        this.productModelService.indexOnlineServices(this.cross.model).subscribe((services:Service[]) => {
            this.services = services;
            
            for(let service of this.cross.online_services){
                let found = this.services.some((serv: { _id: string; }) =>  serv._id === service['id_service']);
                if(found){
                    this.addInitService(service);
                }
            }
        });
        this.productModelService.indexOfflineServices(this.cross.model).subscribe((services:Service[]) => {
            this.offlineServices = services;            
            for(let service of this.cross.offline_services){
                let found = this.offlineServices.some((serv: { _id: string; }) =>  serv._id === service['id_service']);
                if(found){
                    this.addInitOfflineService(service);
                }
            }
        });
    }
    createBrightness(): UntypedFormGroup {
        return this.formBuilder.group({
            light: [null, Validators.required],
            brightness: [0, Validators.required],
        });
    }

    addBrightness(newBrightness?): void {
        this.brightness = this.brightnessForm.get('brightness') as UntypedFormArray;
        if (newBrightness) {
            this.brightness.push(newBrightness);
        } else {
            this.brightness.push(this.createBrightness());
        }
    }

    removeBrightness(i:number) {
        if(this.brightness.length > 1) {
            this.brightness.removeAt(i);
        }
    }

    submitOffsetForm() {
        if(!this.cross.settings) this.cross.settings = new Settings;
        this.cross.settings.temperature = Number(this.offsetForm.controls['temperature'].value);

        const params = {
            settings: this.cross.settings
        }

        this.crossService.update(this.cross._id, params).subscribe(
            res => {
                this.toastService.show('Offset temepatura actualizado.', { classname: 'bg-success text-white' });
            },
            error => {
                console.log(error)
            }
        )
    }

    submitBrightnessForm() {
        this.duplicatedBrightness = false;

        var valueArr = this.brightnessForm.value.brightness.map(function (item) { return item.light });
        var indexes = [];

        var isDuplicate = false;
        valueArr.some(function (item, idx) {
            if(valueArr.indexOf(item) != idx){
                indexes.push(idx);
            }
        });
        
        for(let index of indexes){
            this.brightnessForm.controls['brightness']['controls'][index].setErrors({invalidDuplicate: true});
        }
        if(indexes.length > 0){
            isDuplicate = true;
        }

        if(isDuplicate){
            this.duplicatedBrightness = true;
            
            return false;
        }
        for(let value of this.brightnessForm.controls['brightness'].value){
            value.light = parseInt(value.light);
        }
        if(!this.cross.settings) this.cross.settings = new Settings;
        this.cross.settings.brightness = this.brightnessForm.controls['brightness'].value;

        const params = {
            settings: this.cross.settings
        }
        this.crossService.update(this.cross._id, params).subscribe(
            res => {
                this.cross = res;

                this.brightnessForm = this.formBuilder.group({
                    brightness: this.formBuilder.array([])
                });
    
                this.cross.settings.brightness.forEach(element => {
                    const newBrightness = this.formBuilder.group({
                        light: [element['light'], Validators.required],
                        brightness: [element['brightness'], Validators.required],
                    });
                    this.addBrightness(newBrightness)
                });

                this.valueBrightness = this.brightnessForm.controls['brightness'].value;
                this.brightnessForm.valueChanges.subscribe(() => {
                    this.valueBrightness = this.brightnessForm.controls['brightness'].value;
                });
                
                this.toastService.show('Sistema de brillo actualizado.', { classname: 'bg-success text-white' });
            },
            error => {
                console.log(error)
            }
        );
    }


    compare(a, b) {
        const brightnessA = a.light;
        const brightnessB = b.light;

        let comparison = 0;
        if (brightnessA > brightnessB) {
            comparison = 1;
        } else if (brightnessA < brightnessB) {
            comparison = -1;
        }
        return comparison;
    }

    submitTimeForm() {
        if(!this.cross.settings) this.cross.settings = new Settings;
        this.cross.settings.timezone = this.timeForm.controls['timezone'].value;

        const params = {
            settings: this.cross.settings
        }

        this.crossService.update(this.cross._id, params).subscribe(
          res => {
            this.toastService.show('Huso horario actualizado.', {classname: 'bg-success text-white'});
          },
          error => {
            console.log(error)
          }
        )
      }

    updateService(type){
        var params;
        if(type == 'online'){
            params = {
                online_services : this.cross.online_services
            }
        }else{
            params = {
                offline_services : this.cross.offline_services
            }
        }       
        this.crossService.updateServices(this.cross._id, params).subscribe(
            res => {
                this.toastService.show('Servicio ' + type + ' actualizado.', {classname: 'bg-success text-white'});
            },
            error => {
                console.log(error)
            }
        ) 
    }

    addInitService(service) {
        this.services.forEach((element, index) => {
            if(element._id === service.id_service) {
                if(this.services[index]['status'] == 'active') this.services[index]['status'] = null;
                else this.services[index]['status'] = 'active';
            }
        });
    }
    addInitOfflineService(service){
        this.offlineServices.forEach((element, index) => {
            if(element._id === service.id_service) {
                if(this.offlineServices[index]['status'] == 'active') this.offlineServices[index]['status'] = null;
                else this.offlineServices[index]['status'] = 'active';
            }
        });
    }

    addService(service) {
        this.services.forEach((element, index) => {
            if(element._id === service._id) {
                if(this.services[index]['status'] == 'active') this.services[index]['status'] = null;
                else this.services[index]['status'] = 'active';
            }
        });
    }
    
    addOfflineService(service) {
        this.offlineServices.forEach((element, index) => {
            if(element._id === service._id) {
                if(this.offlineServices[index]['status'] == 'active') this.offlineServices[index]['status'] = null;
                else this.offlineServices[index]['status'] = 'active';
            }
        });
    }
    
    openAddServicesModal(servicesModal){
        this.modalRef = this.modalService.open(servicesModal, { ariaLabelledBy: 'modal-basic-title' } );
    }
    closeModal(){
        this.serviceForm.controls['online_services'].setValue(['']);
        this.services = [];
        this.initServices();
        this.modalRef.dismiss();
    }
    closeOfflineServiceModal(){
        this.offlineServiceForm.controls['offline_services'].setValue(['']);
        this.offlineServices = [];
        this.initServices();
        this.modalRef.dismiss();
    }

    submitServiceForm() {
        this.pushServices = [];
        this.services.forEach(element => {
            if(element['status'] === 'active') {
                var service = {
                    name: element.name,
                    id_service: element._id,
                    active: true,
                    data: null
                }
                this.pushServices.push(service)
            }
        });

        this.serviceForm.controls['online_services'].setValue(this.pushServices);

        this.crossService.updateServices( this.cross._id,this.serviceForm.value).subscribe(
            (cross: Cross) => {
                this.cross = cross;
                this.toastService.show('Servicios Online actualizados.', {classname: 'bg-success text-white'});
                this.modalRef.dismiss();
            },
            error => {
                this.toastService.show('Servicios Online no actualizados.', {classname: 'bg-danger text-white'});
                this.serviceForm.controls['online_services'].setValue(['']);
                this.services = [];
                this.initServices();
            }
        );
    }
    submitOfflineServiceForm() {
        this.pushServices = [];
        this.offlineServices.forEach(element => {
            if(element['status'] === 'active') {
                var service = {
                    name: element.name,
                    id_service: element._id,
                    active: true,
                    data: null
                }
                this.pushServices.push(service)
            }
        });

        this.offlineServiceForm.controls['offline_services'].setValue(this.pushServices);

        this.crossService.updateServices( this.cross._id,this.offlineServiceForm.value).subscribe(
            (cross: Cross) => {
                this.cross = cross;
                this.toastService.show('Servicios Offline actualizados.', {classname: 'bg-success text-white'});
                this.modalRef.dismiss();
            },
            error => {
                this.toastService.show('Servicios Offline no actualizados.', {classname: 'bg-danger text-white'});
                this.offlineServiceForm.controls['offline_services'].setValue(['']);
                this.offlineServices = [];
                this.initServices();
            }
        );
    }
}
