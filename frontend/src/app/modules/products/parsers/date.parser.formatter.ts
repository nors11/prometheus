import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DateParserFormatter extends NgbDateParserFormatter {
    
    private readonly DELIMITER = '/';

    parse(value: string): NgbDateStruct {
        if (value && value != null) {
            let date = value.split(this.DELIMITER);
            return { day: parseInt(date[0], 10), month: parseInt(date[1], 10), year: parseInt(date[2], 10) };
        }
        return null;
    }

    format(date: NgbDateStruct): string {
        return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
    }
}