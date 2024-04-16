import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { SequenceWeekly } from '../models/sequence-weekly';
import { CrossService } from '../services/cross.service';

@Injectable()
export class WeeklyHelper{

    public subscriptions: Subscription[] = [];
    
    constructor(
        private crossService: CrossService
    ) {}

    deleteSequence(weekly, selectedSequence, crossId) {
        for(let day of weekly){
            let sequences: [] = day['sequences'];
            for(let sequence of sequences){
                if(selectedSequence == sequence['_id']){
                    let index = sequences.indexOf(sequence);
                    sequences.splice(index, 1);
                }
            }
        }
        return this._patchWeekly(weekly, crossId);
    }

    async _patchWeekly(weekly, crossId) {
        let weeklyParams = [];

        for (let week of weekly) {
            let fieldsGroup = {};
            Object.keys(week).forEach((field) => {
                if (typeof week[field] !== 'object') {
                    fieldsGroup[field] = week[field];
                }
                if (field === 'sequences') {
                    fieldsGroup[field] = [];
                    for (let sequence of week[field] as Array<SequenceWeekly>) {
                        fieldsGroup['sequences'].push({ _id: sequence._id, from_time: sequence.from_time, to_time: sequence.to_time, id_sequence: sequence.id_sequence });
                    }
                }
            });
            weeklyParams.push(fieldsGroup);
        }
        // Send data to the server
        await this.crossService.patchWeekly(crossId, weeklyParams).toPromise();
        return await this.crossService.indexWeekly(crossId).toPromise();
    }

}
