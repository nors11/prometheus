import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ collection: 'services' })
export class Service {

    @Prop({ required: true })
    name: Type;
    
    @Prop({ required: true })
    offline: boolean;
    
    @Prop({ required: true })
    online: boolean;

    @Prop({ required: false })
    available_attributes: [ObjectId];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

export enum Type {
    weather = 'weather',
    wind = 'wind',
    temperature = 'temperature',
    pressure = 'pressure',
    humidity = 'humidity',
    feels_like = 'feels_like',
    image = 'image',
    animation = 'animation',
    date = 'date',
    time = 'time',
    saints = 'saints',
    text = 'text'
}