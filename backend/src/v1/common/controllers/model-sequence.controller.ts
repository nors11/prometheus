import { Controller, Res, HttpStatus, Body, Post, UseGuards, Get, Param, HttpException, NotFoundException, Delete, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/v1/auth/jwt-auth.guard';
import { ModelSequenceService } from '../services/model-sequence.service';
import { ModelSequence, ModelSequenceDocument } from '../schemas/model-sequence.schema';
import { Sequence } from '../schemas/sequence.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const mongoose = require('mongoose');

@ApiTags('Product Model')
@Controller('v1/model-sequence')
export class ModelSequenceController {

    constructor(
        @InjectModel(ModelSequence.name) private readonly modelSequenceModel: Model<ModelSequenceDocument>,
        private modelSequenceService: ModelSequenceService
    ) {}
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/default')
    async getDefaultSequences(@Res() res, @Body() modelAttributes: []): Promise<ModelSequence[]>{
        const sequences = await this.modelSequenceService.generateDefaultSequences(modelAttributes);
    
        return res.status(HttpStatus.OK).json(sequences);
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'productModelID', required: true })
    @Post('/default/model/:productModelID')
    async getDefaultSequencesByProductModelId(@Res() res, @Param('productModelID') productModelID, @Body() modelAttributes: []): Promise<ModelSequence[]>{
        const sequences = await this.modelSequenceService.generateDefaultSequences(modelAttributes, productModelID);
    
        return res.status(HttpStatus.OK).json(sequences);
    }

    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async batchCreate(@Res() res, @Body() sequences: ModelSequence[]): Promise<Sequence[]>{
        const newSequences = await this.modelSequenceService.createBatch(sequences);
    
        return res.status(HttpStatus.OK).json(newSequences);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/model/:productModelID')
    async viewByCross(@Res() res, @Param('productModelID') productModelID): Promise<ModelSequence[]>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const modelSequences = await this.modelSequenceService.findByModelId(productModelID);
        
            if(modelSequences.length == 0){
                throw new NotFoundException('Model attributes is empty.');
            }
            return res.status(HttpStatus.OK).json(modelSequences);
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/model/:productModelID')
    async deleteModelSequencesByProductModelId(@Res() res, @Param('productModelID') productModelID): Promise<any>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid sequenceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedRows = await this.modelSequenceService.deleteByModelId(productModelID);
        
            if(!deletedRows) throw new NotFoundException('Model Sequences does not exists.');
            
            return res.status(HttpStatus.OK).json(deletedRows);
        }
    }

    @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard)
    @Put('/fix-animations')
    async fixAnimations(@Res() res): Promise<any>{
        var fixedSequences = await this.modelSequenceService.fixAnimations();
        
        return res.status(HttpStatus.OK).json(fixedSequences);
    }
}