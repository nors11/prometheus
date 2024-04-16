import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DistributorDocument = Distributor & Document;

@Schema({ collection: 'distributors' })
export class Distributor {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true, default: true })
    status: boolean;

    @Prop({ required: true })
    email: string;
}

export const DistributorSchema = SchemaFactory.createForClass(Distributor);