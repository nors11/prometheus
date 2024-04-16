import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActionParametersDocument = ActionParameters & Document;
export type ActionDocument = Action & Document;

@Schema()
export class ActionParameters {

    @Prop({ default: '' })
    message: string;

    @Prop({ default: 1, transform: parseInt })
    top_drawing: number;

    @Prop({ default: 1, transform: parseInt })
    bottom_drawing: number;

    @Prop({ default: 5, transform: parseInt })
    effect: number;

    @Prop({ default: true })
    delete_single_row: boolean;

    @Prop({ default: true })
    delete_all: boolean;
 
    @Prop({ default: true })
    text_in_out: boolean;

    @Prop({ default: false })
    text_only_in: boolean;

    @Prop({ default: 1, transform: parseInt })
    font_size: number;

    @Prop({ default: 1, transform: parseInt })
    font_family: number;

    @Prop({ default: 1, transform: parseInt })
    row: number;
    
    @Prop({ default: 5, transform: parseInt })
    speed: number;

    @Prop({ default: 2, transform: parseInt })
    pause: number;

    @Prop({ default: 1, transform: parseInt })
    color: number;

    @Prop({ default: 3, transform: parseInt })
    animation: number;

    @Prop({ default: '' })
    path: string;
    
    @Prop({ default: '' })
    img: string;

    @Prop({ default: false })
    orla: boolean;

}


@Schema()
export class Action {

    @Prop({ required: true })
    type: ActionType;

    @Prop({ required: true, type: ActionParameters })
    parameters;

}

export enum ActionType {
    temperature = 'Temperatura',
    humidity = 'Humedad',
    time = 'Hora',
    date = 'Fecha',
    weather = 'Tiempo',
    text = 'Texto',
    saints = 'Santoral',
    animation = 'Animación',
    image = 'Imagen'
}

export const ActionParametersSchema = SchemaFactory.createForClass(ActionParameters);
export const ActionSchema = SchemaFactory.createForClass(Action);