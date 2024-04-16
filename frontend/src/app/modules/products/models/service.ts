import { Pipe, PipeTransform } from "@angular/core";

export class Service {

    public _id: string;
    public name: Type;
    public type: string;
    public offline: boolean;
    public online: boolean;
    public available_attributes: string[];

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}

export enum Type {
    temperature = 'temperature',
    humidity = 'humidity',
    date = 'date',
    time = 'time',
    weather = 'weather',
    animation = 'animation',
    saints = 'saints',
    wind = 'wind',
    pressure = 'pressure',
    feels_like = 'feels_like',
    text = 'text',
    image = 'image'
}


export const typeAbbreviation = {};
typeAbbreviation[Type.temperature] = 'Temperatura';
typeAbbreviation[Type.humidity] = 'Humedad';
typeAbbreviation[Type.date] = 'Fecha';
typeAbbreviation[Type.time] = 'Hora';
typeAbbreviation[Type.weather] = 'Tiempo';
typeAbbreviation[Type.animation] = 'Animación';
typeAbbreviation[Type.saints] = 'Santoral';
typeAbbreviation[Type.wind] = 'Viento';
typeAbbreviation[Type.pressure] = 'Presión';
typeAbbreviation[Type.feels_like] = 'Sensación térmica';
typeAbbreviation[Type.text] = 'Texto';
typeAbbreviation[Type.image] = 'Imagen';

// Pipe to transform status name to its abbreviation
@Pipe({
    name: 'typeAbbreviation'
})

export class TypeAbbreviationPipe implements PipeTransform {
    transform(type: string): any {
        return typeAbbreviation[type];
    }
}