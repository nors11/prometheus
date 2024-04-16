import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sequence } from './sequence.schema';
import { WeeklyDays } from './weekly.schema';
import { Type } from './service.schema';
import { ApiProperty } from '@nestjs/swagger';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export class AttributeOption{
    @ApiProperty({required: true})
    @Prop({required: true})
    public id: string;

    @ApiProperty({required: true})
    @Prop({required: true})
    public name: string;

    @ApiProperty({required: false})
    @Prop({required: false})
    public path?: string;
}

export type AttributeDocument = Attribute & Document;

@Schema({ collection: 'attributes' })
export class Attribute {

    @Prop({ type: ObjectId, required:true})
    _id;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    type: string;

    @Prop({required: true})
    options: AttributeOption[];
    
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);


