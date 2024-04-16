import { IsString, IsNotEmpty, IsBoolean, IsArray, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Leds, Mask } from "../schemas/product-model.schema";
import { ObjectId } from 'mongoose';

export class CreateProductModelDTO {
    
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @ApiProperty({required: true})
    @IsNotEmpty()
    @IsString()
    type: string;

    @ApiProperty({required: false})
    @IsNumber()
    sources: number;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    fringe: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsBoolean()
    bicolor: boolean;
    
    @ApiProperty({ type: [Mask], required: false })
    @IsArray()
    masks: Mask[];

    @ApiProperty({ type: Leds, required: false })
    top_panel: Leds;

    @ApiProperty({ type: Leds, required: true })
    central_panel: Leds;

    @ApiProperty({ type: Leds, required: false })
    bottom_panel: Leds;

    @ApiProperty({ required: true })
    @IsArray()
    online_services: ObjectId[];
    
    @ApiProperty({ required: true })
    @IsArray()
    offline_services: ObjectId[];
    
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsBoolean()
    active: boolean;
}