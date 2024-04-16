import { Controller, Get, Res, HttpStatus, Post, Body, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ErrorService } from '../services/error.service';
import { Error } from '../schemas/error.schema';
import { CreateErrorDTO } from '../dto/error.dto';

const mongoose = require('mongoose');

@ApiTags('Error')
@Controller('v1/error')
export class ErrorController {
    constructor(private errorService: ErrorService) { }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() error: CreateErrorDTO) {
        const newError = await this.errorService.create(error);

        return res.status(HttpStatus.OK).json({
            message: 'Error successfully Created',
            newError
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async index(@Res() res): Promise<Error[]> {
        const errors = await this.errorService.findAll();
        return res.status(HttpStatus.OK).json({
            errors
        })
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/:errorID')
    async view(@Res() res, @Param('errorID') errorID): Promise<Error> {

        if (!mongoose.isValidObjectId(errorID)) {
            throw new HttpException('Invalid errorID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else {
            const error = await this.errorService.findById(errorID);

            if (!error) {
                throw new NotFoundException('Error Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Error created successfully.',
                error
            })
        }
    }
}