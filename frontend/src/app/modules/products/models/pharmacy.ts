import { Address } from './address';

export class Pharmacy {

    public _id: string;
    public id_distributor: string;
    public name: string;
    public nif: string;
    public address: string;
    public email: Address;
    public phone: string;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}
