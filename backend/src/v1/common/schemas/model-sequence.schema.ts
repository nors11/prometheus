import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Action } from './action.schema';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export type ModelSequenceDocument = ModelSequence & Document;

@Schema({ collection: 'model_sequences' })
export class ModelSequence {

    @Prop({ type: ObjectId, required:false, ref: 'ProductModel' })
    id_model;

    @Prop({required: true})
    name: string;

    @Prop({required: true})
    category: string;

    @Prop({required: false})
    default: boolean;

    @Prop({required: true})
    actions: [Action?];
}

export const ModelSequenceSchema = SchemaFactory.createForClass(ModelSequence);