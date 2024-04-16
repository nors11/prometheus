import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type OnlineServicesDocument = OnlineServices & Document;

@Schema({ collection: 'online_services' })
export class OnlineServices {

    @Prop({ required: true })
    zip: string;
    
    @ApiProperty({ required: false })
    @Prop({ required: false, type: Object })
    weather_data: Object;
}

export const OnlineServicesSchema = SchemaFactory.createForClass(OnlineServices);
