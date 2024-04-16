import { Controller, Get, Res, HttpStatus, Param, Body, Post, UseGuards, HttpException, NotFoundException, Put, Query, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProductModelService } from '../services/product-model.service';
import { ProductModel, Mask } from '../schemas/product-model.schema';
import { JwtAuthGuard } from 'src/v1/auth/jwt-auth.guard';
import { CreateProductModelDTO } from '../dto/product-model.dto';
import { ModelAttributeService } from '../services/model-attribute.service';
import { ModelSequenceService } from '../services/model-sequence.service';
import { Service } from '../schemas/service.schema';

const mongoose = require('mongoose');

@ApiTags('Product Model')
@Controller('v1/product-model')
export class ProductModelController {

    constructor(
        private productModelService: ProductModelService,
        private modelAttributeService: ModelAttributeService,
        private modelSequenceService: ModelSequenceService
    ) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async index(@Res() res, @Query() query): Promise<ProductModel[]>{
        const productModels = await this.productModelService.findAll(query);
        return res.status(HttpStatus.OK).json(productModels)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/:productModelID')
    async view(@Res() res, @Param('productModelID') productModelID): Promise<ProductModel>{
    
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const productModel = await this.productModelService.findById(productModelID);
        
            if(!productModel){
                throw new NotFoundException('Model Does not exists.');
            }
            return res.status(HttpStatus.OK).json(productModel);
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/by-cross/:productModelID')
    async viewByCross(@Res() res, @Param('productModelID') productModelID): Promise<ProductModel>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const productModel = await this.productModelService.findOne(productModelID);
        
            if(!productModel)
            {
                throw new NotFoundException('Product Model Does not exists.');
            }
            return res.status(HttpStatus.OK).json(productModel);
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() model: CreateProductModelDTO){
        const newProductModel = await this.productModelService.create(model);

        return res.status(HttpStatus.OK).json(newProductModel);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('/:productModelID')
    async update(@Res() res, @Param('productModelID') productModelID, @Body() productModel): Promise<ProductModel>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedProductModel = await this.productModelService.update(productModelID, productModel);
            if(!updatedProductModel)
            {
                throw new NotFoundException('Cross Does not exists.');
            }
            
            return res.status(HttpStatus.OK).json(
                updatedProductModel
            )
        }
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'productModelID', required: true})
    @Put('/:productModelID/masks')
    async putMask(@Res() res, @Param('productModelID') productModelID: string, @Body() masks: Mask[]){
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const updatedProductModel = await this.productModelService.addMask(productModelID, masks);
            if(!updatedProductModel)
            {
                throw new NotFoundException('Product Model does not exists.');
            }
            
            return res.status(HttpStatus.OK).json(updatedProductModel);
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/:productModelID')
    async deleteModelSequencesByProductModelId(@Res() res, @Param('productModelID') productModelID): Promise<any>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            // Delete model_attributes
            const deleteModelAttributeRows = await this.modelAttributeService.deleteByModelId(productModelID);
            
            // Delete model_sequences
            const deleteModelSequenceRows = await this.modelSequenceService.deleteByModelId(productModelID);

            // Delete product model
            const deletedRows = await this.productModelService.delete(productModelID);
                    
            return res.status(HttpStatus.OK).json(deletedRows);
        }
    }

    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/options/:productModelID')
    async getModelActionOptions(@Res() res, @Param('productModelID') productModelID): Promise<Object>{
        if(!mongoose.isValidObjectId(productModelID)){
            throw new HttpException('Invalid productModelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const modelAttributes = await this.modelAttributeService.findByModelId(productModelID);
            var attributes = {};

            for(let attribute of modelAttributes){
                if(!attributes[attribute.type_service]) attributes[attribute.type_service] = {};
                
                attributes[attribute.type_service][attribute.type_attribute] = attribute.available_options;
            }
            
            if(!modelAttributes)
            {
                throw new NotFoundException('Product Model Does not exists.');
            }
            
            return res.status(HttpStatus.OK).json(attributes);
        }
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/offline-services/:productModelID')
    async indexOfflineServices(@Res() res,  @Param('productModelID') productModelID): Promise<Service[]>{
        const services = await this.productModelService.getOfflineServices(productModelID);
        return res.status(HttpStatus.OK).json(services)
    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/online-services/:productModelID')
    async indexOnlineServices(@Res() res,  @Param('productModelID') productModelID): Promise<Service[]>{
        const services = await this.productModelService.getOnlineServices(productModelID);
        return res.status(HttpStatus.OK).json(services)
    }
}