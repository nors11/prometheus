import { Controller, Get, Res, HttpStatus, Post, Body, Put, NotFoundException, Delete, Param, UseGuards } from '@nestjs/common';
import { ServiceService } from '../services/service.service';
import { Service } from '../schemas/service.schema';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CreateServiceDTO } from '../dto/service.dto';

const mongoose = require('mongoose');

@ApiTags('Service')
@Controller('v1/service')

export class ServiceController {constructor(private serviceService: ServiceService){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async index(@Res() res): Promise<Service[]>{
        const services = await this.serviceService.findAll();
        return res.status(HttpStatus.OK).json(services)
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/online')
    async indexOnline(@Res() res): Promise<Service[]>{
        const services = await this.serviceService.find({online: true});
        return res.status(HttpStatus.OK).json(
            services
        )
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/offline')
    async indexOffline(@Res() res): Promise<Service[]>{
        const services = await this.serviceService.find({offline: true});
        return res.status(HttpStatus.OK).json(
            services
        )
    }
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/:serviceID')
    async view(@Res() res, @Param('serviceID') serviceID): Promise<Service>{

        if(!mongoose.isValidObjectId(serviceID)){
            throw new HttpException('Invalid serviceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const service = await this.serviceService.findById(serviceID);
        
            if(!service) 
            {
                throw new NotFoundException('Service Does not exists.');
            }
            return res.status(HttpStatus.OK).json(service)
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() service: CreateServiceDTO){
        const newService = await this.serviceService.create(service);

        return res.status(HttpStatus.OK).json({
            message: 'Service successfully Created',
            newService
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/:serviceID')
    async delete(@Res() res, @Param('serviceID') serviceID): Promise<Service>{

        if(!mongoose.isValidObjectId(serviceID)){
            throw new HttpException('Invalid serviceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedService = await this.serviceService.delete(serviceID);
        
            if(!deletedService) 
            {
                throw new NotFoundException('Service Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Service deleted successfully.',
                deletedService
            })
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:serviceID')
    async update(@Res() res, @Param('serviceID') serviceID, @Body() service): Promise<Service>{

        if(!mongoose.isValidObjectId(serviceID)){
            throw new HttpException('Invalid serviceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedService = await this.serviceService.update(serviceID, service);
        
            if(!updatedService) 
            {
                throw new NotFoundException('Service Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Service updated successfully.',
                updatedService
            })
        }
    }
}