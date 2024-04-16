import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SaintDocument = Saint & Document;

@Schema()
export class Saint {

    @Prop({required: true})
    day: number;

    @Prop({required: true})
    month: number;

    @Prop({required: true})
    saints: [string];
}

export const SaintSchema = SchemaFactory.createForClass(Saint);