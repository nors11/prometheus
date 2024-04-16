import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateServiceDTO {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    name: string;
    
}