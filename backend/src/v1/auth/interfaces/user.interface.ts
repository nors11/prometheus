import { Document } from 'mongoose'
import { Distributor } from '../../common/schemas/distributor.schema';

export interface User extends Document {
    readonly id: string;
    readonly email: string;
    password: string;
    readonly name: string;
    readonly surname: string;
    readonly role: string;
    status: boolean;
    readonly distributor: Distributor;
    readonly id_distributor: string;
    readonly id_pharmacy: string;
}