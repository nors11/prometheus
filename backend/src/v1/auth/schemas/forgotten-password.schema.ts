import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ForgottenPasswordDocument = ForgottenPassword & Document;

@Schema({ collection: 'forgotten_password' })
export class ForgottenPassword {

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    token: string;

    @Prop({ required: false })
    creation_date: Date;
}

export const ForgottenPasswordSchema = SchemaFactory.createForClass(ForgottenPassword);