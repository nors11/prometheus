export class SequenceWeekly {

    public _id: string;
    public from_time: string;
    public to_time: string;
    public id_sequence: string;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}