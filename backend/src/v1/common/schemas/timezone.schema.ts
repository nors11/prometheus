import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimezoneDocument = Timezone & Document;

@Schema({ collection: 'timezones' })
export class Timezone {

    @Prop({ required: true })
    name: string;

}

export const TimezoneSchema = SchemaFactory.createForClass(Timezone);