import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Sequence } from '../../models/sequence';
import { SequenceService } from '../../services/sequence.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { SequenceHelper } from '../../helpers/sequence.helper';
import { Cross } from '../../models/cross';
import { Subscription } from 'rxjs';

@Component({
    selector: 'tecneplas-sequences',
    templateUrl: '../../views/sequences/sequences.component.html'
})
export class SequencesComponent implements OnInit {

    @ViewChild('deleteSequenceModal', { static: false }) private deleteSequenceModal;
    public crossId: string;
    public sequences: Sequence[];
    public categories: string[];
    public defaultCategory = '';
    public sequenceForm: UntypedFormGroup;
    public modalRef: NgbModalRef;
    public sequenceCount;
    public sequence: Sequence;
    public location: string;
    public cross: Cross;
    public calendar;
    public weekly;
    public subscriptions: Subscription[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private sequenceService: SequenceService,
        private modalService: NgbModal,
        private formBuilder: UntypedFormBuilder,
        private toastService: ToastService,
        private router: Router,
        private SequenceHelper: SequenceHelper
    ) { }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params) => {
            this.crossId = params.id_cross;

            // Create sequence form
            this.sequenceForm = this.formBuilder.group({
                id_cross: [this.crossId],
                name: ['', Validators.required],
                category: ['', Validators.required]
            });

            // Get sequences grouped by category
            this.subscriptions['indexGroupedByCategory'] = this.sequenceService.indexGroupedByCategory(this.crossId).subscribe((sequences: Sequence[]) => {
                this.sequences = sequences;
                this.sequenceCount = this.sequences.length;
            });
        });
        // Get categories for the sequences
        this.subscriptions['indexCategoriesList'] = this.sequenceService.indexCategoriesList().subscribe((categories: string[]) => {
            this.categories = categories;
            this.sequenceForm.patchValue({ category: this.categories[0]['id'] });
        });
    }
    
    ngOnDestroy() {
        // Remove subscriptions
        for (let subscription in this.subscriptions) {
            this.subscriptions[subscription].unsubscribe();
        }
    }

    openAddSequenceModal(content, category?) {
        if(category){
            this.defaultCategory = category.category;
        }else{
            this.defaultCategory = this.categories[0]['id'];
        }
        this.modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    }

    submitForm() {
        this.modalRef.dismiss();
        var nameExists = this.checkDuplicates(this.sequenceForm.value);

        if(nameExists){
            this.toastService.show('El nom de sequencia està repetit', { classname: 'bg-danger text-white' });
        }else{
            // Create sequence
            this.subscriptions['createSequence'] = this.sequenceService.create(this.sequenceForm.value).subscribe((sequence: Sequence) => {
                this.toastService.show('Secuencia creada correctamente.', { classname: 'bg-success text-white' });
                this.router.navigate(['cross/', this.crossId, 'sequence', sequence._id, 'actions']);
            },
            (error) => {
                this.toastService.show('Error creando la secuencia', { classname: 'bg-danger text-white' });
            });
        }        
    }
    async deleteSequence(event, sequence) {
        event.stopPropagation();
        this.sequence = sequence;
        var result = await this.SequenceHelper.deleteSequence(sequence, this.crossId);
        if(result){
            this.calendar = result.calendar;
            this.location = result.location;
            this.weekly = result.weekly;
            this.modalRef = this.modalService.open(this.deleteSequenceModal, { ariaLabelledBy: 'modal-basic-title' });
        }
    }
    async acceptDeleteSequence(sequence){
        if(this.modalRef) this.modalRef.close();
        this.sequences = await this.SequenceHelper.acceptDeleteSequence(sequence, this.crossId, this.calendar, this.weekly);
        this.sequenceCount = this.sequences.length;
        this.location = null;
        this.calendar = null;
        this.weekly = null;
    }

    duplicateSequence(event, sequence) {
        event.stopPropagation();
        let newSequence = JSON.parse(JSON.stringify(sequence));
        delete newSequence._id;
        delete newSequence.default;
        newSequence.name = newSequence.name + ' (copia)';
        newSequence.name = this.SequenceHelper.checkDuplicateSequence(this.sequences, sequence, newSequence.name);
        
        this.subscriptions['createSequence'] = this.sequenceService.create(newSequence).subscribe((sequence: Sequence) => {
            this.toastService.show('Secuencia creada correctamente.', { classname: 'bg-success text-white' });
            this.router.navigate(['cross/', this.crossId, 'sequence', sequence._id, 'actions']);
        },
        (error) => {
            this.toastService.show('Error creando la secuencia', { classname: 'bg-danger text-white' });
        });
    }

    checkDuplicates(newSequence){
        for(let sequence of this.sequences){
            if(sequence.category == newSequence.category){
                if(sequence['list'].find(seq => seq.name === newSequence.name)){
                    return true;
                }
            }
        }
        return false;
    }
}
