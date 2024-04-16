import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema()
export class Address {
    
    @Prop({ required:true })
    street_name: string;

    @Prop({ required:true })
    number: number;

    @Prop({ required:true })
    zip: string;

    @Prop({ required:true })
    city: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);