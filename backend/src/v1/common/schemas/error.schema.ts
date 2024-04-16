import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export type ErrorDocument = Error & Document;

@Schema({ collection: 'errors' })
export class Error {

    @Prop({ type: ObjectId, required:true, ref: 'Cross' })
    id_cross: string;

    @Prop({ required: false })
    device: number;
    
    @Prop({ required: false })
    status: boolean;
    
    @Prop({ required: true })
    category: Category;

    @Prop({ required: true })
    date: Date;

    @Prop({required: false})
    leds_ko: number;

    @Prop({required: false})
    leds_message: string;
}

export enum Category {
    power_supply = 'power_supply',
    fan = 'fan',
    led = 'led',
}

export const ErrorSchema = SchemaFactory.createForClass(Error);