import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const ObjectId = require('mongoose').Schema.Types.ObjectId;

export type CrossCalendarDocument = CrossCalendar & Document;

@Schema({ collection: 'crosses_calendars' })
export class CrossCalendar {

    @Prop({ type: ObjectId, required:true, ref: 'Cross' })
    id_cross;

    @Prop({ type: ObjectId, required:true, ref: 'Sequence' })
    id_sequence;

    @Prop({required: false})
    date_start: Date;

    @Prop({ required: false })
    all_day: boolean;

    @Prop({ required: false })
    time_start: string;

    @Prop({required: false})
    time_end: string;
}

export const CrossCalendarSchema = SchemaFactory.createForClass(CrossCalendar);