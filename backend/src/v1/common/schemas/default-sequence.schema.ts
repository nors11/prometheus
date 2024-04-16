import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Action } from './action.schema';

export type DefaultSequenceDocument = DefaultSequence & Document;

@Schema({ collection: 'default_sequences' })
export class DefaultSequence {

    @Prop({required: true})
    name: string;

    @Prop({required: true})
    category: string;

    @Prop({required: true, default: true})
    default: boolean;

    @Prop({required: true})
    actions: [Action];
}

export const DefaultSequenceSchema = SchemaFactory.createForClass(DefaultSequence);