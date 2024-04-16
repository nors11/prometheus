import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Address }  from './address.schema';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export type PharmacyDocument = Pharmacy & Document;

@Schema({ collection: 'pharmacies' })
export class Pharmacy {

    @Prop({ type: ObjectId, required:false, ref: 'Pharmacy' })
    id_distributor;

    @Prop({ required: true })
    name: string;

    @Prop({required: true})
    nif: string;

    @Prop({required: true})
    address: Address;

    @Prop({required: true})
    email: string;

    @Prop({required: false})
    phone: string;
    
    @Prop({ type: ObjectId, required:false, ref: 'User' })
    creator;
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);