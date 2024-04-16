import { Brightness } from "./brightness";


export class Settings{
    public brightness: [Brightness];
    public timezone: string;
    public temperature: number;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}