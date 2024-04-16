import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Document } from 'mongoose';

const ObjectId = require('mongoose').Types.ObjectId;

export type ProductModelDocument = ProductModel & Document;

export class Leds{
    @ApiProperty({ required: true })
    @Prop({ required: true })
    @IsNumber()
    width: number
    
    @ApiProperty({ required: true })
    @Prop({ required: true })
    @IsNumber()
    height: number
}

@Schema({ collection: 'product_models' })
export class ProductModel {

    @Prop({required: true})
    name: string;
    
    @Prop({required: true})
    type: ProductType;

    @Prop({required: true})
    fringe: FringeType;

    @Prop({required: false})
    sources: number;
    
    @Prop({required: true})
    bicolor: boolean;
    
    @Prop({required: false})
    masks: Mask[];

    @Prop({required: false})
    top_panel: Leds;

    @Prop({required: true})
    central_panel: Leds;

    @Prop({required: false})
    bottom_panel: Leds;

    @Prop({ type: [ObjectId], required:true, ref: 'Service' })
    online_services;
    
    @Prop({ type: [ObjectId], required: true, ref: 'Service' })
    offline_services;
    
    @Prop({required: true})
    active: boolean;
}

export class Mask{
    @ApiProperty({ required: true })
    @Prop({ required: true })
    @IsArray()
    mask: [[number]];
}

export enum ProductType {
    cross = 'Cruz',
    sign = 'Panel'
}

export enum FringeType {
    none = 'Sin orla',
    malta = 'Malta',
    griega = 'Griega',
    milenium = 'Milenium',
    laguna = 'Laguna',
    raise = 'Raise',
    raisemalta = 'Raise Malta'
}

export const ProductModelSchema = SchemaFactory.createForClass(ProductModel);