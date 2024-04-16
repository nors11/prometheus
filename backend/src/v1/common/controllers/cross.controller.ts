import { Controller, Get, Res, HttpStatus, Post, Body, Patch, NotFoundException, Delete, Param, UseGuards, Inject, Put, Query } from '@nestjs/common';
import { CrossService } from '../services/cross.service';
import { Cross, CrossDocument, Mode } from '../schemas/cross.schema';
import { PharmacyService } from '../services/pharmacy.service';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model } from 'mongoose';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';

const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

@ApiTags('Cross')
@Controller('v1/cross')
export class CrossController {constructor(
    @Inject(REQUEST) private readonly request: Request,
    private crossService: CrossService,
    private pharmacyService: PharmacyService,
    @InjectModel(Cross.name) private readonly productModel: Model<CrossDocument>
    ){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() cross: Cross){
        
        cross._id = new mongoose.Types.ObjectId();
        const pharmacy = await this.pharmacyService.findById(cross.id_pharmacy);

        await this.crossService.updateServices(cross._id, cross.id_pharmacy, cross);
        let newCross = await this.crossService.create(cross);

        return res.status(HttpStatus.OK).json({
            message: 'Cross successfully Created',
            newCross,
            pharmacy
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'name_surnames', required: false })
    @Get('/')
    async index(@Res() res, @Query() query): Promise<Cross[]>{
        const crosses = await this.crossService.findAll(query);

        return res.status(HttpStatus.OK).json(crosses)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/count')
    async count(@Res() res): Promise<number>{
        const countCrosses = await this.crossService.count();

        return res.status(HttpStatus.OK).json(countCrosses)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'name_surnames', required: false })
    @Get('/pharmacy/:id_pharmacy')
    async getByPharmacy(@Res() res, @Param('id_pharmacy') id_pharmacy:string, @Query() query): Promise<Cross[]>{
        const crosses = await this.crossService.getByPharmacy(id_pharmacy, query);

        return res.status(HttpStatus.OK).json(crosses);
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/pharmacy/:id_pharmacy/count')
    async countByPharmacy(@Res() res, @Param('id_pharmacy') id_pharmacy:string): Promise<number>{
        const countCrosses = await this.crossService.count({id_pharmacy: id_pharmacy});

        return res.status(HttpStatus.OK).json(countCrosses);
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'name_surnames', required: false })
    @Get('/distributor/:id_distributor')
    async getByDistributor(@Res() res, @Param('id_distributor') id_distributor:string, @Query() query): Promise<Cross[]>{
        const crosses = await this.crossService.getByDistributor(id_distributor, query);

        return res.status(HttpStatus.OK).json(crosses);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/distributor/:id_distributor/count')
    async countByDistributor(@Res() res, @Param('id_distributor') id_distributor:string): Promise<number>{
        const countCrosses = await this.crossService.countByDistributor(id_distributor);

        return res.status(HttpStatus.OK).json(countCrosses);
    }

    @ApiBearerAuth()
    @Get('/number_plate/:number_plate')
    async numberPlate(@Res() res, @Param('number_plate') number_plate:string): Promise<Cross>{
        const cross = await this.productModel.find({number_plate: number_plate});
        
        if(Object.keys(cross).length != 0) {
            throw new NotFoundException('Number plate exists.');
        }

        return res.status(HttpStatus.OK).json({
            message: 'Number plate not exists.'
        });
    }

    @ApiBearerAuth()
    @Get('/newssid/:ssid')
    async ssid(@Res() res, @Param('ssid') ssid:string): Promise<Cross>{
        const cross = await this.productModel.find({ssid: ssid.toLowerCase()});
        
        if(Object.keys(cross).length != 0) {
            throw new NotFoundException('Number ssid exists.');
        }

        return res.status(HttpStatus.OK).json({
            message: 'Number ssid not exists.'
        });
    }

    @ApiBearerAuth()
    @Get('/ssid/:ssid')
    async getConfiguration(@Res() res, @Param('ssid') ssid:string): Promise<Cross>{
        const cross = await this.crossService.getConfiguration(ssid.toLowerCase());

        if(!cross) {
            throw new NotFoundException('Cross Does not exists.');
        }
        var stringifiedCross = JSON.stringify(cross);
        var hashedCross = createHash('sha256').update(stringifiedCross).digest('base64');
        var response = { data: cross, hash: hashedCross };

        return res.status(HttpStatus.OK).json(response);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/:crossID/weekly')
    async getWeekly(@Res() res, @Param('crossID') crossID:string): Promise<Cross>{
        const weekly = await this.crossService.getWeekly(crossID);

        if(!weekly) {
            throw new NotFoundException('Weekly Does not exists.');
        }

        return res.status(HttpStatus.OK).json(weekly);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'crossID', required: true})
    @Get('/:crossID')
    async view(@Res() res, @Param('crossID') crossID): Promise<[Cross]>{
        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid crossID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const cross = await this.crossService.findById(crossID);
        
            if(!cross) 
            {
                throw new NotFoundException('Cross Does not exists.');
            }
            return res.status(HttpStatus.OK).json(cross)
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'crossID', required: true})
    @Delete('/:crossID')
    async delete(@Res() res, @Param('crossID') crossID): Promise<Cross>{

        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid crossID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedCross = await this.crossService.delete(crossID);
        
            if(!deletedCross)
            {
                throw new NotFoundException('Cross Does not exists.');
            }
            return res.status(HttpStatus.OK).json({
                message: 'Cross deleted successfully.',
                deletedCross
            })
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:crossID')
    async update(@Res() res, @Param('crossID') crossID, @Body() cross): Promise<Cross>{
        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid crossID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedCross = await this.crossService.update(crossID, cross, true);
            if(!updatedCross)
            {
                throw new NotFoundException('Cross Does not exists.');
            }
            this.crossService.sendCrossSettings(updatedCross);
            return res.status(HttpStatus.OK).json(updatedCross)
        }
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/operative/:crossID')
    async updateOperative(@Res() res, @Param('crossID') crossID, @Body() cross): Promise<Cross>{

        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid crossID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedCross = await this.crossService.update(crossID, cross);
        
            if(!updatedCross) 
            {
                throw new NotFoundException('Cross Does not exists.');
            }
            return res.status(HttpStatus.OK).json(
                updatedCross
            )
        }
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:crossID/services')
    async updateServices(@Res() res, @Param('crossID') crossID, @Body() cross): Promise<Cross>{

        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid crossID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const oldCross = await this.productModel.findById(new ObjectId(crossID));
            const updatedCross = await this.crossService.updateServices(crossID, oldCross.id_pharmacy, cross);
        
            if(!updatedCross) 
            {
                throw new NotFoundException('Cross Does not exists.');
            }
        
            this.crossService.sendServices(updatedCross);
            return res.status(HttpStatus.OK).json(
                updatedCross
            )
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('/:crossID/weekly')
    async patchtWeekly(@Res() res, @Param('crossID') crossID:string, @Body() weeklyBody): Promise<Cross>{
        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid crossID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const weekly = await this.crossService.getWeekly(crossID);
            
            if(!weekly) throw new NotFoundException('Weekly Does not exists.');
            
            const updatedWeeklyCalendar = await this.crossService.patchWeekly(crossID, weeklyBody)
            
            if(!updatedWeeklyCalendar) throw new NotFoundException('Weekly Does not exists.');

            this.crossService.sendWeekly(crossID);
                        
            return res.status(HttpStatus.OK).json(updatedWeeklyCalendar);
        }
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:crossID/mode/:mode')
    async updateMode(@Res() res, @Param('crossID') crossID, @Param('mode') mode:Mode): Promise<Cross>{

        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid crossID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedCross = await this.productModel.findByIdAndUpdate({ _id:new ObjectId(crossID) },{ mode: mode },{ new:true });
        
            if(!updatedCross)
            {
                throw new NotFoundException('Cross Does not exists.');
            }
            this.crossService.changeCrossmode(updatedCross);

            return res.status(HttpStatus.OK).json(
                updatedCross
            )
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/alerts/errors')
    async indexWithErrors(@Res() res): Promise<any>{
        const user = this.request.user;
        const crosses = await this.crossService.findAllWithErrors(user);

        return res.status(HttpStatus.OK).json(crosses);
    }
}