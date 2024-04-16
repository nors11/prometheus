import { IsString, IsNotEmpty, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDistributorDTO {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    address: string;
    
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsBoolean()
    status: Boolean;
    
}