import { IsString, IsEmail, IsNotEmpty, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDTO {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsString()
    password: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsString()
    surname: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    role: string;

    @ApiProperty({ required: false, default: true })
    @IsNotEmpty()
    @IsBoolean()
    status: boolean;

    @ApiProperty({ required: false })
    @IsString()
    id_distributor: string;

    @ApiProperty({ required: false })
    @IsString()
    id_pharmacy: string;
}