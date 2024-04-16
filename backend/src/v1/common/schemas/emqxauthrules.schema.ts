import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmqxAuthRulesDocument = EmqxAuthRules & Document;

@Schema({ collection: 'emqxauthrules' })
export class EmqxAuthRules {

    @Prop({ required: true })
    username: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true})
    pubsub: string[];
}
export enum Topics {
    calendar = 'calendar',
    weekly = 'weekly',
    mode = 'mode',
    settings = 'settings',
    services = 'services',
    login = 'login',
    status = 'status/#',
    grounding = 'grounding',
    operative = 'operative',
    saints = 'saints',
    reports = 'reports'
}

export const EmqxAuthRulesSchema = SchemaFactory.createForClass(EmqxAuthRules);