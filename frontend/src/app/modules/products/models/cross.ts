import { Pipe, PipeTransform } from '@angular/core';
import { Sequence } from './sequence';
import { WeeklyDays } from './weekly';
import { Pharmacy } from './pharmacy';
import { Settings } from './settings';

export class Cross {

    public _id: string;
    public id_pharmacy: string;
    public type: string;
    public name: string;
    public number_plate: string;
    public model: string;
    public operative: boolean;
    public grounding: boolean;
    public sequences: [Sequence];
    public calendar: string[];
    public weekly: [WeeklyDays];
    public mode: Mode;
    public status: boolean;
    public online_services: [];
    public offline_services: [];
    public contract: string;
    public pharmacy: Pharmacy;
    public settings: Settings;
    public connectivity: boolean;
    public wifiSSID: string;
    public password: string;
    public language: Language;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}

export enum Mode {
    normal = 'normal',
    guardia = 'guardia',
    cerrado = 'cerrado'
}

export const modeAbbreviation = {};
modeAbbreviation[Mode.normal] = 'Normal';
modeAbbreviation[Mode.guardia] = 'Guardia';
modeAbbreviation[Mode.cerrado] = 'Cerrado';

@Pipe({
    name: 'modeAbbreviation'
})

export class ModeAbbreviationPipe implements PipeTransform {
    transform(mode: string): any {
        return modeAbbreviation[mode];
    }
}

export enum Language {
    es = 'es',
    ca = 'ca'
}

export const languageAbbreviation = {};
languageAbbreviation[Language.es] = 'Español';
languageAbbreviation[Language.ca] = 'Català';

@Pipe({
    name: 'languageAbbreviation'
})

export class LanguageAbbreviationPipe implements PipeTransform {
    transform(language: string): any {
        return languageAbbreviation[language];
    }
}
