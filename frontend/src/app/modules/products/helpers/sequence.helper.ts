import { Injectable } from '@angular/core';
import { CrossService } from '../services/cross.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';
import { WeeklyHelper } from './weekly.helper';
import { SequenceService } from '../services/sequence.service';
import { CrossCalendarService } from '../services/cross-calendar.service';

@Injectable()
export class SequenceHelper{
    public calendar;
    public sequence;
    public cross;
    public weekly;
    public location;
    public modalRef: NgbModalRef;
    public crossId;

    constructor(
        private crossService: CrossService,
        private toastService: ToastService,
        private weeklyHelper: WeeklyHelper,
        private sequenceService: SequenceService,
        private crossCalendarService: CrossCalendarService
    ) {}

    checkDuplicateSequence(sequences, sequence, sequenceName){
        
        var exists;
        for(let seq of sequences){
            if(seq.category == sequence.category){
                exists = seq['list'].filter(existingSequence => existingSequence.name.includes(sequenceName));
            }
        }
        if(exists != null){
            var index = 0;
            for(var existingSequence of exists){
                if(existingSequence.name.includes('_') && parseInt(existingSequence.name.substring(existingSequence.name.indexOf('_') + 1)) > index){
                    index = parseInt(existingSequence.name.substring(existingSequence.name.indexOf('_') + 1));
                }
            }
            if(index == 0){
                sequenceName = sequenceName + '_1';
            }else{
                sequenceName = sequenceName + '_' + sequenceName.substring(0, sequenceName.indexOf('_')) + (index + 1);
            }
        }
        return sequenceName;
    }

    async deleteSequence(sequence, crossId) {
        this.crossId = crossId;
        if(sequence.default == true){
            this.toastService.show('Las sequencias Predeterminadas no se pueden eliminar', { classname: 'bg-danger text-white' });
        }else{
            return await this.findSequenceInWeeklyAndCalendar(sequence, crossId);
        }
    }  

    async findSequenceInWeeklyAndCalendar(sequence, crossId){
        this.sequence = sequence;
        var cross = await this.crossService.view(crossId).toPromise();
        this.cross = cross;

        var existsInCalendar = false;
        var calendar = cross['crosses_calendars'].filter(cal => cal.id_sequence == sequence._id);
        if(calendar.length > 0) existsInCalendar = true;
        
        var existsInWeekly = false;
        var week = [];
        for(let day of cross.weekly){
            var daySequences = day.sequences.filter(seq => seq['id_sequence'] == sequence._id);
            week.push(daySequences);
            if(daySequences.length > 0) existsInWeekly = true;            
        }
        
        var location = null;
        if(existsInWeekly || existsInCalendar){
            if(existsInWeekly && existsInCalendar){
                location = 'Semanario y en el Calendario';
            }
            else if(existsInWeekly){
                location = 'Semanario';
            }
            else{
                location = 'Calendario';
            }
        }
        return {calendar: calendar, location: location, weekly: week};
    
    }
    
    async acceptDeleteSequence(sequence, crossId, calendar, week, noActions?){
        this.crossService.indexWeekly(crossId).subscribe((weekly: []) => {
            for(let day of week){
                for(let seq of day){
                    this.weeklyHelper.deleteSequence(weekly, seq._id, crossId);
                }
            }
        });
        await this.sequenceService.delete(sequence._id).toPromise().then(()=>{
            if(noActions && noActions == false) this.toastService.show('Secuencia eliminada correctamente.', { classname: 'bg-success text-white' });
        })
        .catch(()=>{
            this.toastService.show('Error eliminando la sequencia.', { classname: 'bg-danger text-white' });
        });
        if(calendar){
            for(let crossCalendar of calendar){
                await this.crossCalendarService.delete(crossCalendar._id).toPromise();
            }
        }
        
        var sequences = await this.sequenceService.indexGroupedByCategory(crossId).toPromise();
        return sequences;
    }
}
