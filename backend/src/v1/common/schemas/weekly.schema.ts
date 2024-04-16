import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sequence } from './sequence.schema';

export type WeeklyDaysDocument = WeeklyDays & Document;

@Schema()
export class WeeklyDays {

    @Prop({required: true})
    day_of_week_number: number;

    @Prop({required: true})
    day_of_week_name: string;

    @Prop({required: true})
    sequences: [Sequence];
}

export const WeeklyDaysSchema = SchemaFactory.createForClass(WeeklyDays);