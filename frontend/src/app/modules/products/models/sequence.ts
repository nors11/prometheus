import { Action } from './action';

export class Sequence {

    public _id: string;
    public id_cross: string;
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