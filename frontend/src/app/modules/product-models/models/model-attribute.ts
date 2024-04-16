export class ModelAttribute {

    public _id: string;
    public id_model: string;
    public id_service: string;
    public id_attribute: string;
    public type_service: string;
    public type_attribute: string;
    public available_options: AttributeOption[];
    
    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}

export class AttributeOption{
    public id: number;
    public name: string;
}
