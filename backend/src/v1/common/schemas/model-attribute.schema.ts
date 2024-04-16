import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { AttributeOption } from './attribute.schema';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export type ModelAttributeDocument = ModelAttribute & Document;

@Schema({ collection: 'model_attributes' })
export class ModelAttribute {

    @Prop({ type: ObjectId, required:true, ref: 'ProductModel' })
    id_model;    
    
    @Prop({ type: ObjectId, required:true, ref: 'Service' })
    id_service;
    
    @Prop({ type: ObjectId, required:true, ref: 'Attribute' })
    id_attribute;
    
    @Prop()
    type_attribute: string;
    
    @Prop()
    type_service: string;

    @Prop({ required:true })
    available_options: [AttributeOption];
}

export const ModelAttributeSchema = SchemaFactory.createForClass(ModelAttribute);