import { Controller, Get, Res, HttpStatus, Post, Body, Put, Query, NotFoundException, Delete, Param, UseGuards, Inject } from '@nestjs/common';
import { PharmacyService } from '../services/pharmacy.service';
import { Pharmacy, PharmacyDocument } from '../schemas/pharmacy.schema';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


const mongoose = require('mongoose');

const ObjectId = require('mongoose').Types.ObjectId;

@ApiTags('Pharmacy')
@Controller('v1/pharmacy')
export class PharmacyController {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        @InjectModel(Pharmacy.name) private readonly pharmacyModel: Model<PharmacyDocument>,
        private pharmacyService: PharmacyService
    ){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() pharmacy){
        const id_user = this.request.user['id'];
        
        if(!mongoose.isValidObjectId(id_user)){
            pharmacy.creator =new ObjectId(id_user);
        }
        else{
            pharmacy.creator = id_user;
        }
        
        const newPharmacy = await this.pharmacyService.create(pharmacy);

        return res.status(HttpStatus.OK).json({
            message: 'Pharmacy successfully Created',
            newPharmacy
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'name_surnames', required: false })
    @Get('/')
    async index(@Res() res, @Query() query): Promise<Pharmacy[]>{

        const pharmacies = await this.pharmacyService.findAll(query);

        return res.status(HttpStatus.OK).json(pharmacies)
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/count')
    async count(@Res() res): Promise<number>{
        const numPharmacies = await this.pharmacyModel.countDocuments({});

        return res.status(HttpStatus.OK).json(numPharmacies)
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/distributor/:distributorID')
    async indexByDistributor(@Res() res, @Param('distributorID') distributorID): Promise<Pharmacy[]>{

        const pharmacies = await this.pharmacyService.findAllByDistributor(distributorID);        

        return res.status(HttpStatus.OK).json(pharmacies)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/count/distributor/:distributorID')
    async countByDistributor(@Res() res, @Param('distributorID') distributorID): Promise<number>{
 
        const numPharmacies = await this.pharmacyService.count({id_distributor: distributorID});
        return res.status(HttpStatus.OK).json(numPharmacies)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/:pharmacyID')
    async view(@Res() res, @Param('pharmacyID') pharmacyID): Promise<Pharmacy>{
    
        if(!mongoose.isValidObjectId(pharmacyID)){
            throw new HttpException('Invalid pharmacyID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const pharmacy = await this.pharmacyService.findById(pharmacyID);
        
            if(!pharmacy) 
            {
                throw new NotFoundException('Pharmacy Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                pharmacy
            })
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/:pharmacyID')
    async delete(@Res() res, @Param('pharmacyID') pharmacyID): Promise<Pharmacy>{

        if(!mongoose.isValidObjectId(pharmacyID)){
            throw new HttpException('Invalid pharmacyID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedPharmacy = await this.pharmacyService.delete(pharmacyID);
        
            if(!deletedPharmacy) 
            {
                throw new NotFoundException('Pharmacy Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Pharmacy deleted successfully.',
                deletedPharmacy
            })
        }
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:pharmacyID')
    async update(@Res() res, @Param('pharmacyID') pharmacyID, @Body() pharmacy): Promise<Pharmacy>{

        if(!mongoose.isValidObjectId(pharmacyID)){
            throw new HttpException('Invalid pharmacyID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedPharmacy = await this.pharmacyService.update(pharmacyID, pharmacy);
        
            if(!updatedPharmacy) 
            {
                throw new NotFoundException('Pharmacy Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Pharmacy updated successfully.',
                updatedPharmacy
            })
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('find/:pharmacyID')
    async find(@Res() res, @Param('pharmacyID') pharmacyID): Promise<Pharmacy>{
    
        if(!mongoose.isValidObjectId(pharmacyID)){
            throw new HttpException('Invalid pharmacyID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const pharmacy = await this.pharmacyService.findById(pharmacyID);
        
            if(!pharmacy) 
            {
                throw new NotFoundException('Pharmacy Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                pharmacy
            })
        }
    }

}