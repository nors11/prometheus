import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, CalendarOptions, DurationInput } from '@fullcalendar/angular';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import esLocale from '@fullcalendar/core/locales/es';
import { Sequence, SequenceCategoryClass } from '../../models/sequence';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SequenceService } from '../../services/sequence.service';
import { CrossService } from '../../services/cross.service';
import { Subscription } from 'rxjs';
import { WeeklyDays } from '../../models/weekly';
import { ToastService } from 'src/app/services/toast.service';
import { WeeklyHelper } from '../../helpers/weekly.helper';

@Component({
    selector: 'tecneplas-weekly',
    templateUrl: '../../views/weekly/weekly.component.html',
})
export class WeeklyComponent implements OnInit {

    public crossId: string;
    public sequences: Sequence[] = [];
    public weekly = [];
    public subscriptions: Subscription[] = [];
    public modalRef: NgbModalRef;
    public selectedDayOfWeek: WeeklyDays;
    public weeklySequenceForm: UntypedFormGroup;
    public delSequenceForm: UntypedFormGroup;
    public selectedSequence: string = null;
    public totalSequences: number = 0;
    public slotDuration = '00:30:00';
    public slotLabelInterval: DurationInput = {
        hours: 0,
        minutes: 30,
        seconds: 0
    };

    public weeklyOptions: CalendarOptions = {
        initialView: 'timeGridWeek',
        headerToolbar: false,
        dayHeaderFormat: {
            weekday: 'short'
        },
        allDaySlot: false,
        height: 'auto',
        eventDurationEditable: true,
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
        },
        slotDuration: this.slotDuration,
        slotLabelInterval: this.slotLabelInterval,
        locale: esLocale,
        firstDay: 1,
        eventOverlap: false,
        editable: true,
        dateClick: this.openAddWeekly.bind(this),
        eventResize: this.updateSequenceElementToTime.bind(this),
        eventClick: this.editSequence.bind(this),
        eventDrop: this.moveSequence.bind(this)
    };

    @ViewChild('addCrossWeeklySequenceModal', { static: false }) private addCrossWeeklySequenceModal;
    @ViewChild('crossWeekly') fullCalendarComponent: FullCalendarComponent;
    @ViewChild("slotDurationInput",{static:true}) slotDurationInput:ElementRef;
    

    constructor(
        private activatedRoute: ActivatedRoute,
        private sequenceService: SequenceService,
        private crossService: CrossService,
        private formBuilder: UntypedFormBuilder,
        private modalService: NgbModal,
        private toastService: ToastService,
        private weeklyHelper: WeeklyHelper
    ) { }

    ngAfterViewChecked(): void {
        window.dispatchEvent(new Event('resize'));
    }

    ngOnInit(): void {
        this.weeklySequenceForm = this.formBuilder.group({
            id_sequence: ['', Validators.required],
            from_time: [{ value: '', disabled: true }, Validators.required],
            to_time: [{ value: '', disabled: true }, Validators.required]
        })

        this.activatedRoute.params.subscribe((params) => {
            this.crossId = params.id_cross;

            // Get weekly data
            this.subscriptions['indexWeekly'] = this.crossService.indexWeekly(this.crossId).subscribe((weekly: []) => {
                this.weekly = weekly;

                this._loadWeekly2Calendar(weekly);
            });

            // Get sequences grouped by category
            this.subscriptions['indexGroupedByCategory'] = this.sequenceService.indexGroupedByCategory(this.crossId).subscribe((sequences: Sequence[]) => {
                for(let sequence of sequences){
                    this.totalSequences = this.totalSequences + sequence['list'].length;
                }
                this.sequences = sequences;
            });
        });
    }

    onChange(time) {
        this.slotDuration = time;
        if(time == '00:10:00') {
            this.slotDuration = '00:10:00'
            this.slotLabelInterval = {
                hours: 0,
                minutes: 10,
                seconds: 0
            }
        }else if(time == '00:15:00') {
            this.slotDuration = '00:15:00'
            this.slotLabelInterval = {
                hours: 0,
                minutes: 15,
                seconds: 0
        }
        }else if(time == '00:30:00') {
            this.slotDuration = '00:30:00'
            this.slotLabelInterval =  {
                hours: 0,
                minutes: 30,
                seconds: 0
            }
        }else if(time == '01:00:00') {
            this.slotDuration = '01:00:00'
            this.slotLabelInterval = {
                hours: 1,
                minutes: 0,
                seconds: 0
            }
        }
        this.weeklyOptions.slotDuration = this.slotDuration;
        this.weeklyOptions.slotLabelInterval = this.slotLabelInterval;
        this.slotDurationInput.nativeElement.blur();
    }

    openAddWeekly(info) {
        // Set from_time field value
        const from_time = ('0' + info.date.getHours()).slice(-2) + ':' + ('0' + info.date.getMinutes()).slice(-2) + ':' + ('0' + info.date.getSeconds()).slice(-2);
        this.weeklySequenceForm.get('from_time').setValue(from_time);

        // Set to_time field value
        this.selectedDayOfWeek = this.weekly.find((week: WeeklyDays) => week.day_of_week_number === info.date.getDay());
        
        if (this.selectedDayOfWeek.sequences.length > 0) {
            // Sort sequences by from_time
            this.selectedDayOfWeek.sequences.sort((a, b) => {
                
                let aFromTime = a['from_time'].split(':');
                let bFromTime = b['from_time'].split(':');

                let aFromDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), aFromTime[0], aFromTime[1], aFromTime[2]).getTime());
                let bFromDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), bFromTime[0], bFromTime[1], bFromTime[2]).getTime());

                return aFromDate.getTime() - bFromDate.getTime();
            });

            // Get next sequence from time selected
            let sequence = null;
            for (let seq of this.selectedDayOfWeek.sequences) {
                if (from_time <= seq['from_time']) {
                    sequence = seq;
                    break;
                }
            }
            if(sequence != null){
                // Set from_time field value
                const sequenceFromTime = sequence['from_time'].split(':');
                const toDate = new Date(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), sequenceFromTime[0], sequenceFromTime[1], sequenceFromTime[2]).getTime() - 1000);
                const to_time = ('0' + toDate.getHours()).slice(-2) + ':' + ('0' + toDate.getMinutes()).slice(-2) + ':' + ('0' + toDate.getSeconds()).slice(-2);
                this.weeklySequenceForm.get('to_time').setValue(to_time);
            }
            else{
                this.weeklySequenceForm.get('to_time').setValue('23:59:59');
            }
        }
        else{
            this.weeklySequenceForm.get('to_time').setValue('23:59:59');
        }
        // Open modal
        this.modalRef = this.modalService.open(this.addCrossWeeklySequenceModal, { ariaLabelledBy: 'modal-basic-title', size: 'md' });  
    }

    updateSequenceElementToTime(eventResizeInfo) {
        this.selectedDayOfWeek = this.weekly.find((week: WeeklyDays) => week.day_of_week_number === eventResizeInfo.event.end.getDay());

        // Set to_time field value
        if (this.selectedDayOfWeek.sequences.length > 0) {
            const from_time = ('0' + eventResizeInfo.event.start.getHours()).slice(-2) + ':' + ('0' + eventResizeInfo.event.start.getMinutes()).slice(-2) + ':' + ('0' + eventResizeInfo.event.start.getSeconds()).slice(-2);
            const sequence = this.selectedDayOfWeek.sequences.find((seq) => seq['from_time'] == from_time);
            sequence['to_time'] = ('0' + eventResizeInfo.event.end.getHours()).slice(-2) + ':' + ('0' + eventResizeInfo.event.end.getMinutes()).slice(-2) + ':' + ('0' + eventResizeInfo.event.end.getSeconds()).slice(-2);
        }

        // Save weekly changes to database
        this._patchWeekly();
    }

    editSequence(info){
        this.selectedSequence = info.event._def.publicId;

        this.selectedDayOfWeek = this.weekly.find((week: WeeklyDays) => week.day_of_week_number === info.event.end.getDay());
        const sequence = this.selectedDayOfWeek.sequences.find((seq) => seq['_id'] == info.event._def.publicId);

        this.weeklySequenceForm.controls['id_sequence'].patchValue(sequence['id_sequence']);
        this.modalRef = this.modalService.open(this.addCrossWeeklySequenceModal, { ariaLabelledBy: 'modal-basic-title', size: 'md' });
    }
    
    moveSequence(info){
        var sequence = null;
        var differentDay = false;
        
        for(let day of this.weekly){
            for(let seq of day.sequences){
                if(seq._id.toString() == info.event._def.publicId.toString()){
                    sequence = seq;
                    if(info.event.end.getDay() != day.day_of_week_number){
                        const index = day.sequences.indexOf(seq, 0);
                        if (index > -1) {
                            day.sequences.splice(index, 1);
                            differentDay = true;
                        }
                        differentDay = true;
                    }
                }
            }
        }
        this.selectedDayOfWeek = this.weekly.find((week: WeeklyDays) => week.day_of_week_number === info.event.end.getDay());
        this.selectedSequence = info.event._def.publicId;
        if(differentDay) this.selectedDayOfWeek.sequences.push(sequence);

        if(this.selectedDayOfWeek.sequences.length > 0){

            sequence['from_time'] = ('0' + info.event.start.getHours()).slice(-2) + ':' + ('0' + info.event.start.getMinutes()).slice(-2) + ':' + ('0' + info.event.start.getSeconds()).slice(-2);
            sequence['to_time'] =  ('0' + info.event.end.getHours()).slice(-2) + ':' + ('0' + info.event.end.getMinutes()).slice(-2) + ':' + ('0' + info.event.end.getSeconds()).slice(-2);
            
            this._patchWeekly();
        }
        
        this.selectedSequence = null;
    }

    submitFormAddCrossWeeklySequence() {
        if(this.selectedSequence){
            const sequence = this.selectedDayOfWeek.sequences.find((seq) => seq['_id'] == this.selectedSequence);
            sequence['id_sequence'] = this.weeklySequenceForm.get('id_sequence').value;
        }else{
            this.selectedDayOfWeek.sequences.push(this.weeklySequenceForm.getRawValue());
        }

        // Save weekly changes to database
        this._patchWeekly();

        this.closeModal();        
    }

    async deleteWeeklySequence(){
         if(this.selectedSequence != null && this.weekly.length > 0){
            this.weeklyHelper.deleteSequence(this.weekly, this.selectedSequence, this.crossId).then((weekly)=>{
                this.weekly = weekly;
                this.toastService.show('Semanario actualizado correctamente.', { classname: 'bg-success text-white' });
                this._loadWeekly2Calendar(this.weekly);
            })
            .catch(() => {
                this.toastService.show('Error actualizando el semanario', { classname: 'bg-danger text-white' });
            })
        }
        
        this.selectedSequence = null;
        this.modalRef.dismiss();
    }
    closeModal(){
        this.weeklySequenceForm.reset();
        this.weeklySequenceForm.controls['id_sequence'].patchValue('');
        this.selectedSequence = null;
        this.modalRef.dismiss();
    }
    ngOnDestroy() {
        // Remove subscriptions
        for (let subscription in this.subscriptions) {
            this.subscriptions[subscription].unsubscribe();
        }
    }


    /* *****************
      *
      * SUPPORT FUNCTIONS
      *
      * *****************/


    /**
     * Private function to load the weekly data to the fullcalendar component
     *
     * @return void
     */
    _loadWeekly2Calendar(weekly) {
        this.fullCalendarComponent.getApi().removeAllEvents();

        const currentDate = new Date();
        const diff = currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1);
        const date = new Date(currentDate.setDate(diff));

        // Assign sequences for each day
        for (let i = 1; i <= 7; i++) {
            const dayOfWeek = (i != 7) ? i : 0;
            const day: [] = weekly.find((day) => day['day_of_week_number'] == dayOfWeek);

            if (i > 1) date.setDate(date.getDate() + 1);

            // Set sequence to the calendar
            if (day['sequences']) {
                for (let sequence of day['sequences']) {
                    const time_start = sequence.from_time.split(':');
                    const time_end = sequence.to_time.split(':');

                    const event = {
                        id: sequence['_id'],
                        title: sequence['name'],
                        start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), time_start[0], time_start[1], time_start[2]),
                        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), time_end[0], time_end[1], time_end[2]),
                        allDay: false,
                        classNames: ['bg-' + SequenceCategoryClass[sequence['category']], 'fc-spacing-event']
                    }

                    this.fullCalendarComponent.getApi().addEvent(event);
                }
            }
        }
    }

    /**
     * Private function for patching weekly permanently to database
     *
     * @return void
     */
    async _patchWeekly() {
        this.weeklyHelper._patchWeekly(this.weekly, this.crossId).then((weekly)=>{
            this.weekly = weekly;
            this._loadWeekly2Calendar(this.weekly);
            this.toastService.show('Semanario actualizado correctamente.', { classname: 'bg-success text-white' });
        })
        .catch(() => {
            this.toastService.show('Error actualizando el semanario', { classname: 'bg-danger text-white' });
        })
    }

}
