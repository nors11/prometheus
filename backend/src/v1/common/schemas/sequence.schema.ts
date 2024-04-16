import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Action } from './action.schema';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export type SequenceDocument = Sequence & Document;

@Schema()
export class Sequence {

    @Prop({ type: ObjectId, required:false, ref: 'Cross' })
    id_cross;

    @Prop({required: true})
    name: string;

    @Prop({required: true})
    category: string;

    @Prop({required: false})
    default: boolean;

    @Prop({required: true})
    actions: [Action?];
}

export enum SequenceCategory {
    daily = 'Diaria',
    holiday = 'Festiva',
    on_guard = 'Guardia'
}

export const SequenceSchema = SchemaFactory.createForClass(Sequence);