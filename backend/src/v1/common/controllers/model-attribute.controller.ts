import { Controller, Res, HttpStatus, Body, Post, UseGuards, Get, HttpException, NotFoundException, Param, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { JwtAuthGuard } from 'src/v1/auth/jwt-auth.guard';
import { ModelAttribute, ModelAttributeDocument } from '../schemas/model-attribute.schema';
import { ModelAttributeService } from '../services/model-attribute.service';

const mongoose = require('mongoose');

@ApiTags('Model Attribute')
@Controller('v1/model-attribute')
export class ModelAttributeController {

    constructor(
        @InjectModel(ModelAttribute.name) private readonly modelAttributeModel: Model<ModelAttributeDocument>,
        private modelAttributeService: ModelAttributeService
    ) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() modelAttributes: ModelAttribute[]){
        
        const newModelAttributes = await this.modelAttributeModel.insertMany(modelAttributes);
    
        return res.status(HttpStatus.OK).json(newModelAttributes);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/model/:productModelID')
    async viewByCross(@Res() res, @Param('productModelID') productModelID): Promise<ModelAttribute[]>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const modelAttributes = await this.modelAttributeService.findByModelId(productModelID);
        
            if(modelAttributes.length == 0){
                throw new NotFoundException('Model attributes is empty.');
            }
            return res.status(HttpStatus.OK).json(modelAttributes);
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/model/:productModelID')
    async deleteModelAttributesByProductModelId(@Res() res, @Param('productModelID') productModelID): Promise<any>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid sequenceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedModelAttributes = await this.modelAttributeService.deleteByModelId(productModelID);
        
            if(!deletedModelAttributes) throw new NotFoundException('Model Attributes does not exists.');
            
            return res.status(HttpStatus.OK).json(deletedModelAttributes);
        }
    }

}