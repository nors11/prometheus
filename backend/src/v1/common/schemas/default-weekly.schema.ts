import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sequence } from './sequence.schema';

export type DefaultWeeklyDaysDocument = DefaultWeeklyDays & Document;

@Schema({ collection: 'default_weekly_days' })
export class DefaultWeeklyDays {

    @Prop({required: true})
    day_of_week_number: number;

    @Prop({required: true})
    day_of_week_name: string;

    @Prop({required: true})
    sequences: [Sequence];
}

export const DefaultWeeklyDaysSchema = SchemaFactory.createForClass(DefaultWeeklyDays);