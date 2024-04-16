export class Distributor {

    public _id: string; 
    public name: string;
    public address: string;
    public status: string;
    public email: string;
    
    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}
