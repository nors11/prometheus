
export class Brightness{
    public light: number;
    public brightness: number;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}
