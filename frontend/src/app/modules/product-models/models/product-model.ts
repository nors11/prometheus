import { Service } from "../../products/models/service";

export class ProductModel {

    public _id: string;
    public name: string;
    public type: string;
    public fringe: string;
    public masks:any[];
    public sources: number;
    public bicolor: boolean;
    public top_panel: Leds;
    public central_panel: Leds;
    public bottom_panel: Leds;
    public online_services: Service[];
    public offline_services: Service[];
    public active: boolean;
    
    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}

export class Leds{
    public width: number;
    public height: number;
}
