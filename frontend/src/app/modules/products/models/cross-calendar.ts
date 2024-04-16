export class CrossCalendar {

    public _id: string;
    public id_cross: string;
    public id_sequence: string;
    public dates: [Date];
    public all_day: boolean;
    public time_start: string;
    public time_end: string;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}
