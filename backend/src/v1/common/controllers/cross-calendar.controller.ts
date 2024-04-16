import { Controller, Res, HttpStatus, Post, Get, Body, UseGuards, Param, NotFoundException, Patch, Delete } from '@nestjs/common';
import { CrossCalendarService } from '../services/cross-calendar.service';
import { CrossCalendar } from '../schemas/cross-calendar.schema';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Model, ObjectId } from 'mongoose';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { CrossService } from '../services/cross.service'; 
import { Cross, CrossDocument } from '../schemas/cross.schema';
const ObjectId = require('mongoose').Types.ObjectId;

const mongoose = require('mongoose');

@ApiTags('CrossCalendar')
@Controller('v1/cross-calendar')
export class CrossCalendarController {    
    constructor(
        private crossCalendarService: CrossCalendarService,
        @InjectModel('Cross') private readonly productModel: Model<CrossDocument>,
        private crossService: CrossService
    ){}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/bulk')
    async create(@Res() res, @Body() crossCalendar){
        let newCrossCalendars:CrossCalendar[] = [];
        if(crossCalendar.dates.length > 0) {
            for(let date of crossCalendar.dates) {
                const newCrossCalendar = new CrossCalendar();
                newCrossCalendar.id_cross = crossCalendar.id_cross;
                newCrossCalendar.id_sequence = crossCalendar.id_sequence;
                newCrossCalendar.date_start = new Date(date);
                newCrossCalendar.all_day = crossCalendar.all_day;
                newCrossCalendar.time_start = crossCalendar.time_start;
                newCrossCalendar.time_end = crossCalendar.time_end;
                
                newCrossCalendars.push(await this.crossCalendarService.create(newCrossCalendar));
            }
        }

        let crosses = [];
        for(let calendar of newCrossCalendars){
            const updatedCross = await this.productModel.findOneAndUpdate({_id:new ObjectId(calendar.id_cross)}, { $push: { calendar:new ObjectId(calendar['_id']) } }, {new: true});
            if(!crosses.includes(updatedCross)){
                crosses.push(updatedCross);
            }
        }
        
        for(let cross of crosses){
            this.crossService.sendCalendar(cross._id);
        }

        return res.status(HttpStatus.OK).json(newCrossCalendars);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/cross/:crossId')
    async indexCrossCalendarByCrossId(@Res() res, @Param('crossId') crossId: string): Promise<CrossCalendar[]>{
        if(!mongoose.isValidObjectId(crossId)){
            throw new HttpException('Invalid sequenceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const crossCalendars = await this.crossCalendarService.getCrossCalendarByCrossId(crossId);
        
            if(!crossCalendars) {
                throw new NotFoundException('CrossCalendar Does not exists.');
            }
            return res.status(HttpStatus.OK).json(crossCalendars)
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('/:crossCalendarID')
    async update(@Res() res, @Param('crossCalendarID') crossCalendarID, @Body() crossCalendar): Promise<CrossCalendar>{

        if(!mongoose.isValidObjectId(crossCalendarID)){
            throw new HttpException('Invalid crossCalendarID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedCrossCalendar = await this.crossCalendarService.update(crossCalendarID, crossCalendar);
            
            if(!updatedCrossCalendar) {
                throw new NotFoundException('Cross Calendar Does not exists.');
            }
            
            this.crossService.sendCalendar(updatedCrossCalendar.id_cross);
            
            return res.status(HttpStatus.OK).json(updatedCrossCalendar);
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/:crossCalendarID')
    async delete(@Res() res, @Param('crossCalendarID') crossCalendarID): Promise<Cross>{

        if(!mongoose.isValidObjectId(crossCalendarID)){
            throw new HttpException('Invalid crossCalendarID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedCrossCalendar = await this.crossCalendarService.delete(crossCalendarID);
            if(!deletedCrossCalendar) 
            {
                throw new NotFoundException('CrossCalendar Does not exists.');
            }
            await this.crossService.deleteFromCalendar(deletedCrossCalendar['_id'], deletedCrossCalendar.id_cross);
            await this.crossService.sendCalendar(deletedCrossCalendar.id_cross);
            
            return res.status(HttpStatus.OK).json({
                message: 'CrossCalendar deleted successfully.',
                deletedCrossCalendar
            })
        }
    }
}