import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular';
import { NgbModal, NgbModalRef, NgbDateStruct, NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Sequence, SequenceCategoryClass } from '../../models/sequence';
import { SequenceService } from '../../services/sequence.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import esLocale from '@fullcalendar/core/locales/es';
import { DateParserFormatter } from '../../parsers/date.parser.formatter';
import { CrossCalendarService } from '../../services/cross-calendar.service';
import { ToastService } from 'src/app/services/toast.service';
import { CrossCalendar } from '../../models/cross-calendar';

@Component({
    selector: 'tecneplas-calendar',
    templateUrl: '../../views/calendar/calendar.component.html',
    providers: [
        { provide: NgbDateParserFormatter, useClass: DateParserFormatter }
    ]
})
export class CalendarComponent implements OnInit {

    public modalRef: NgbModalRef;
    public crossId: string;
    public sequences: Sequence[];
    public crossCalendars: CrossCalendar[];
    public model: NgbDateStruct;
    public crossCalendarForm: UntypedFormGroup;
    public startDate = { year: null, month: null };
    public totalSequences: number = 0;
    public minTime = '00:00:00';


    public calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        locale: esLocale,
        firstDay: 1,
        dateClick: this.openAddCalendarModal.bind(this),
        eventClick: this.openEditCalendarModal.bind(this),
        events: [],
        eventOrder: 'time_start'
    };

    @ViewChild('addCrossCalendarModal', { static: false }) private addCrossCalendarModal;
    @ViewChild('editCrossCalendarModal', { static: false }) private editCrossCalendarModal;
    @ViewChild('crossCalendar') fullCalendarComponent: FullCalendarComponent;

    constructor(
        private activatedRoute: ActivatedRoute,
        private sequenceService: SequenceService,
        private modalService: NgbModal,
        private formBuilder: UntypedFormBuilder,
        private crossCalendarService: CrossCalendarService,
        private toastService: ToastService
    ) { }

    ngAfterViewChecked(): void {
        window.dispatchEvent(new Event('resize'));
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params) => {
            this.crossId = params.id_cross;

            // Get calendars list for current cross
            this.getCrossCalendarList();

            // Get sequences grouped by category
            this.sequenceService.indexGroupedByCategory(this.crossId).subscribe((sequences: Sequence[]) => {
                for(let sequence of sequences){
                    this.totalSequences = this.totalSequences + sequence['list'].length;
                }
                this.sequences = sequences;
            });
        });
    }

    openAddCalendarModal(info) {
        const selectedDate: Date = new Date(info.date.getFullYear(), info.date.getMonth(), info.date.getDate());

        // Set month to current date
        this.startDate = { year: info.date.getFullYear(), month: info.date.getMonth() + 1 };

        this.crossCalendarForm = this.formBuilder.group({
            id_cross: [this.crossId],
            id_sequence: ['', Validators.required],
            dates: this.formBuilder.array([selectedDate]),
            all_day: [true],
            time_start: [{ value: '', disabled: true }, Validators.required],
            time_end: [{ value: '', disabled: true }, Validators.required]
        });

        this.modalRef = this.modalService.open(this.addCrossCalendarModal, { ariaLabelledBy: 'modal-basic-title', size: 'md' });
    }

    openEditCalendarModal(info) {
        const crossCalendar = this.crossCalendars.find((crossCalendar) => crossCalendar._id === info.event.id);
        const date_start = { year: info.event.start.getFullYear(), month: info.event.start.getMonth() + 1, day: info.event.start.getDate() };

        // Set month to current date
        this.startDate = { year: info.event.start.getFullYear(), month: info.event.start.getMonth() + 1 };
        if (crossCalendar) {
            this.crossCalendarForm = this.formBuilder.group({
                _id: [crossCalendar._id],
                id_cross: [crossCalendar.id_cross],
                id_sequence: [crossCalendar.id_sequence, Validators.required],
                date_start: [date_start, Validators.required],
                all_day: [crossCalendar.all_day],
                time_start: [crossCalendar.time_start, Validators.required],
                time_end: [crossCalendar.time_end, Validators.required]
            });
            this.toggleAllDay(crossCalendar.all_day);
            this.modalRef = this.modalService.open(this.editCrossCalendarModal, { ariaLabelledBy: 'modal-basic-title', size: 'md' });
        }
    }

    onDateSelection(date: NgbDate) {
        const selectedDate: Date = new Date(date.year, date.month - 1, date.day);
        const dates: Array<Date> = this.crossCalendarForm.get('dates').value;
        const index: number = dates.findIndex(date => date.getTime() === selectedDate.getTime());

        if (index != -1) {
            dates.splice(index, 1);
        }
        else {
            dates.push(selectedDate);
        }
    }

    isDateSelected(date: NgbDateStruct) {
        const selectedDate: Date = new Date(date.year, date.month - 1, date.day);

        // If user is adding new date
        if (this.crossCalendarForm.get('dates')) {
            const dates: Array<Date> = this.crossCalendarForm.get('dates').value;
            const index: number = dates.findIndex(date => date.getTime() === selectedDate.getTime());

            return (index != -1) ? true : false;
        }
        else {
            const date_start = new Date(this.crossCalendarForm.get('date_start').value.year, this.crossCalendarForm.get('date_start').value.month - 1, this.crossCalendarForm.get('date_start').value.day);

            return (date_start.getTime() === selectedDate.getTime());
        }
    }

    submitFormAddCrossCalendar() {
        if(!this.crossCalendarForm.value.all_day){
            var input = (<HTMLInputElement>document.getElementById('formTimeEnd')).value;
            if(input < this.minTime){
                this.toastService.show('La hora final no puede ser anterior a la inicial', { classname: 'bg-danger text-white' });
                return;
            }
        }
        

        this.crossCalendarService.createBulk(this.crossCalendarForm.value).subscribe((crossCalendar: CrossCalendar[]) => {
            // Get calendars list for current cross
            this.getCrossCalendarList();

            const message = (crossCalendar.length == 1) ? 'Secuencia añadida correctamente al calendario' : 'Secuencias añadidas correctamente al calendario';
            this.toastService.show(message, { classname: 'bg-success text-white' });
        },
            (error) => {
                this.toastService.show('Error añadiendo las secuencias al calendario', { classname: 'bg-danger text-white' });
            });

        this.modalRef.dismiss();
    }

    submitFormEditCrossCalendar() {
        if(!this.crossCalendarForm.value.all_day){
            var input = (<HTMLInputElement>document.getElementById('formTimeEnd')).value;
            if(input < this.minTime){
                this.toastService.show('La hora final no puede ser anterior a la inicial', { classname: 'bg-danger text-white' });
                return;
            }
        }

        const crossCalendarId = this.crossCalendarForm.get('_id').value;

        // Change NgbDatepicker date_start format to Date()
        const date_start = this.crossCalendarForm.get('date_start').value;
        this.crossCalendarForm.get('date_start').setValue(new Date(date_start.year, date_start.month - 1, date_start.day));

        this.crossCalendarService.patch(crossCalendarId, this.crossCalendarForm.value).subscribe((crossCalendar: CrossCalendar) => {
            // Get calendars list for current cross
            this.getCrossCalendarList();

            this.toastService.show('Secuencia del calendario actualizada correctamente', { classname: 'bg-success text-white' });
        },
            (error) => {
                this.toastService.show('Error actualizando la secuencia del calendario', { classname: 'bg-danger text-white' });
            });

        this.modalRef.dismiss();
    }

    deleteCalendarSequence(){
        const crossCalendarId = this.crossCalendarForm.get('_id').value;
        this.crossCalendarService.delete(crossCalendarId).subscribe((crossCalendar: CrossCalendar) => {
            // Get calendars list for current cross
            this.getCrossCalendarList();

            this.toastService.show('Secuencia del calendario eliminada correctamente', { classname: 'bg-success text-white' });
        },
            (error) => {
                this.toastService.show('Error eliminando la secuencia del calendario', { classname: 'bg-danger text-white' });
            });
        this.modalRef.dismiss();
    }

    private getCrossCalendarList() {
        this.crossCalendarService.index(this.crossId).subscribe((crossCalendars: CrossCalendar[]) => {
            this.crossCalendars = [];
            this.crossCalendars = crossCalendars;
            this.fullCalendarComponent.getApi().removeAllEvents();
            if (crossCalendars.length > 0) {
                for (let calendar of crossCalendars) {
                    const event = {
                        id: calendar['_id'],
                        title: calendar['name'],
                        start: calendar['date_start'],
                        allDay: true,
                        classNames: 'bg-' + [SequenceCategoryClass[calendar['category']]]
                    }
                    this.fullCalendarComponent.getApi().addEvent(event);
                }
            }
        });
    }

    get f() { return this.crossCalendarForm.controls; }

    toggleAllDay(e){
        var check = e;

        if(check == true)
        {
            this.f.time_start.disable();
            this.f.time_end.disable();
            this.f.time_start.setValue('');
            this.f.time_end.setValue('');
        }else{
            this.f.time_start.enable();
            this.f.time_end.enable();
        }
    }
    valuechange(e){
        this.minTime = e;
    }
}
