import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsDate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Category } from "../schemas/error.schema";

export class CreateErrorDTO {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    id_cross: string;

    @ApiProperty({ required: false })
    @IsNumber()
    device: number;

    @ApiProperty({ required: false })
    @IsBoolean()
    status: boolean;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    category: Category;
    
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsDate()
    date: Date;
    
    @ApiProperty({ required: false })
    @IsNumber()
    leds_ko: number;
    
    @ApiProperty({ required: false })
    @IsString()
    leds_message: string;
}