export class Address {

    public _id: string;
    public street_name: string;
    public number: number;
    public zip: string;
    public city: string;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}
