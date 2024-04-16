import { Sequence } from './sequence';

export class WeeklyDays {

    public day_of_week_number: number;
    public day_of_week_name: string;
    public sequences: [Sequence];

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}
