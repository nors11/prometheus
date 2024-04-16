import { Action } from '../../products/models/action';

export class ModelSequence {

    public _id: string;
    public id_model: string;
    public name: string;
    public category: string;
    public actions: [Action]
    public default: boolean;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}

export enum SequenceCategoryClass {
    daily = 'daily',
    holiday = 'holiday',
    on_guard = 'on_guard'
}