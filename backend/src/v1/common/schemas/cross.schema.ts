import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sequence } from './sequence.schema';
import { WeeklyDays } from './weekly.schema';
import { Type } from './service.schema';
import { ApiProperty } from '@nestjs/swagger';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export class Settings{
    @ApiProperty({ required: false })
    @Prop({ required: false })
    brightness: [Brightness];
    
    @ApiProperty({required: false})
    @Prop({required: false})
    timezone: string;
    
    @ApiProperty({required: false})
    @Prop({required: false})
    temperature: number;
}

export class Brightness{
    @ApiProperty({required: false})
    @Prop({required: false})
    public light: number;

    @ApiProperty({required: false})
    @Prop({required: false})
    public brightness: number;
}

export class OperativePerson {
    
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    nif: string;
}

export type CrossDocument = Cross & Document;

export enum Mode {
    normal = 'normal',
    guardia = 'guardia',
    cerrado = 'cerrado'
}

@Schema({ collection: 'crosses' })
export class Cross {

    @Prop({ type: ObjectId, required:true})
    _id;

    @Prop({ type: ObjectId, required:false, ref: 'Pharmacy' })
    id_pharmacy;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true, default: false })
    status: boolean;

    @Prop({ required: true })
    name: string;

    @Prop({required: true})
    number_plate: string;

    @Prop({required: true})
    ssid: string;

    @Prop({type: ObjectId, required: true, ref: 'product_model'})
    model;

    @Prop({required: true, default: true})
    connectivity: boolean;

    @Prop({required: false})
    wifiSSID: string;
    
    @Prop({required: false})
    password: string;

    @Prop({required: true})
    language: string;

    @Prop({required: false})
    operative: boolean;

    @Prop({required: false})
    operative_person: OperativePerson;

    @Prop({required: false})
    grounding: boolean;

    @Prop({required: false})
    sequences: [Sequence];
    
    @Prop({required: true})
    weekly: [WeeklyDays];
    
    @Prop({required: true, default: Mode.normal})
    mode: Mode;
    
    @Prop({type: [ObjectId], required: true})
    calendar;

    @Prop({required: false})
    online_services: [OnlineService];
    
    @Prop({required: true})
    offline_services: [OfflineService];

    @Prop({required: true})
    contract: string;

    @Prop({required: false})
    settings: Settings;
}

export const CrossSchema = SchemaFactory.createForClass(Cross);
export class OnlineService {
    @ApiProperty({ required: true })
    @Prop({ type: ObjectId, required: false, ref: 'Services' })
    id_service: string;
    
    @ApiProperty({ required: true })
    @Prop({ required: true })
    name: Type;

    @ApiProperty({ required: false })
    @Prop({ required: false, type: Object })
    data: Object;

    @ApiProperty({ required: true })
    @Prop({ required: true })
    active: boolean;
}

export class OfflineService {
    @ApiProperty({ required: true })
    @Prop({ type: ObjectId, required: false, ref: 'Services' })
    id_service: string;
    
    @ApiProperty({ required: true })
    @Prop({ required: true })
    name: Type;

    @ApiProperty({ required: false })
    @Prop({ required: false, type: Object })
    data: Object;

    @ApiProperty({ required: true })
    @Prop({ required: true })
    active: boolean;
}