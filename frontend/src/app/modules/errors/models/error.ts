import { Pipe, PipeTransform } from '@angular/core';

export class Error {

    public _id: string;
    public device: number;
    public category: Category;
    public date: Date;
    public status: boolean;
    public leds_ko: number;
    public leds_message: string;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}

export enum Category {
    power_supply = 'power_supply',
    fan = 'fan',
    led = 'led'
}

export const categoryAbbreviation = {};
categoryAbbreviation[Category.power_supply] = 'fuente de alimentación';
categoryAbbreviation[Category.fan] = 'ventilador';
categoryAbbreviation[Category.led] = 'led';

// Pipe to transform status name to its abbreviation
@Pipe({
    name: 'categoryAbbreviation'
})

export class CategoryAbbreviationPipe implements PipeTransform {
    transform(category: string): any {
        return categoryAbbreviation[category];
    }
}