import { Pipe, PipeTransform } from "@angular/core";

export class Account {

    public id: number;
    public role: string;
    public name: string;
    public surname: string;
    public email: string;
    public pass: string;
    public accessToken: string;
    public id_pharmacy: string;
    public id_distributor: string;

    constructor() {
    }

    public get(field): any {
        return this[field];
    }

    public set(field, value) {
        this[field] = value;
    }
}

export enum UserRole {
    admin = 'admin',
    distributor = 'distributor',
    pharmacy = 'pharmacy'
}

export const roleAbbreviation = {};
roleAbbreviation[UserRole.admin] = 'Administrador';
roleAbbreviation[UserRole.distributor] = 'Distribuidor';
roleAbbreviation[UserRole.pharmacy] = 'Farmacia';

// Pipe to transform status name to its abbreviation
@Pipe({
    name: 'roleAbbreviation'
})

export class RoleAbbreviationPipe implements PipeTransform {
    transform(role: string): any {
        return roleAbbreviation[role];
    }
}