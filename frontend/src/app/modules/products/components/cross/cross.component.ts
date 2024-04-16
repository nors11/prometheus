import { KeyValue } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { Cross, Mode } from '../../models/cross';
import { CrossService } from '../../services/cross.service';
import { NgbModal, NgbModalRef, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NifValidator } from '../../../../validators/nif.validator';

@Component({
    selector: 'tecneplas-products',
    templateUrl: '../../views/cross/cross.component.html'
})
export class CrossComponent implements OnInit, AfterViewInit {

    public crossId: string;
    public cross: Cross;
    public activeTab = 'weekly';
    public mode = Mode;
    public selectedMode: Mode;
    public interval;
    public modalRef: NgbModalRef;
    public operativePersonForm: UntypedFormGroup;

    @ViewChild('nav') nav;
    @ViewChild("content",{static:true}) content:ElementRef;
    
    constructor(
        private activatedRoute: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private crossService: CrossService,
        private toastService: ToastService,
        config: NgbModalConfig, private modalService: NgbModal,
        private router: Router,
    ) {
        config.backdrop = 'static';
        config.keyboard = false;
     }

    ngOnInit(): void {
        this.operativePersonForm = this.formBuilder.group({
            name: ['', Validators.required],
            nif: ['', [ Validators.required, NifValidator ]],
        });

        this.activatedRoute.params.subscribe((params) => {
            this.crossId = params.id_cross;

            this.getCross();
            this.interval = setInterval(() => {
                if(this.cross && this.cross.operative == true){
                    this.getCross();
                } 
            }, 5000);           
        });
    }

    ngAfterViewInit() {
        var savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            setTimeout(() => {
                this.nav.select(savedTab);
            });
        }
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    updateCross(event){
        this.cross = event;
    }
    getCross(){
        this.crossService.view(this.crossId).subscribe((cross: Cross) => {
            this.cross = cross;
            if(!this.cross.operative && !this.cross.grounding) this.modalRef = this.modalService.open(this.content, { size:'lg' });
            this.selectedMode = this.cross.mode;
            for (const key in Mode) {
                if (this.cross.mode == key) {
                    this.selectedMode = Mode[key];
                }
            }
        });
    }

    saveTab(tab) {
        localStorage.setItem('activeTab', tab);
    }

    modelChangeFn(event){
        this.cross.mode = event;

        //Save attribute to cross
        this.crossService.putMode(this.crossId, event).subscribe((cross: Cross) => {
            this.toastService.show('Modo cambiado correctamente.', { classname: 'bg-success text-white' });
        },
        (error) => {
            this.toastService.show('Error cambiando el modo.', { classname: 'bg-danger text-white' });
        });
    }

    originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
        return 0;
    }

    operative(operative) {
        if(!operative) {
            this.modalRef.dismiss();
            this.router.navigate(['products']);
        }
        else if(operative && this.operativePersonForm.valid) {
            this.modalRef.dismiss();
            
            const params = {
                operative: operative,
                operative_person: this.operativePersonForm.getRawValue()
            }
            this.crossService.update(this.crossId, params).subscribe(
                () => {
                    this.toastService.show('Garantia actualizada', { classname: 'bg-success text-white' })
                },
                (error) => {
                    console.log(error)
                }
            );
        }
    }

}
