import { Controller, Get, Res, HttpStatus, Post, Body, Patch, NotFoundException, Delete, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

import { Sequence, SequenceCategory } from '../schemas/sequence.schema';
import { SequenceService } from '../services/sequence.service';
import { ActionType, ActionParametersSchema } from '../schemas/action.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as TecneplasHelper from '../tecneplas.helper';
import { AppConstants } from 'src/app.constants';
import * as path from "path";
import { CrossService } from '../services/cross.service';
import { Cross, CrossDocument, Mode } from '../schemas/cross.schema';
import { ModelAttributeService } from '../services/model-attribute.service';
import { ImagePipe } from '../pipes/image.pipe';

const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

@ApiTags('Sequence')
@Controller('v1/sequence')
export class SequenceController {
    constructor(
        @InjectModel(Cross.name) private readonly crossModel: Model<CrossDocument>,
        private sequenceService: SequenceService,
        private crossService: CrossService,
        private modelAttributeService: ModelAttributeService
    ) {

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Res() res, @Body() sequence: Sequence){
        if(!sequence.actions) sequence.actions = [];
        const newSequence = await this.sequenceService.create(sequence);

        return res.status(HttpStatus.OK).json(newSequence);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/category/:crossId')
    async indexSequencesGroupedByCategory(@Res() res, @Param('crossId') crossId: string): Promise<[]>{        
        // Get sequences grouped by categories
        const sequences = await this.sequenceService.getSequencesGroupedByCategory(crossId);

        return res.status(HttpStatus.OK).json(sequences)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/categories')
    async indexCategoriesList(@Res() res): Promise<[]>{
        const categories = []  
      
        for (const [propertyKey, propertyValue] of Object.entries(SequenceCategory)) {  
            if (!Number.isNaN(Number(propertyKey))) {  
                continue;  
            }  
            categories.push({ id: propertyKey, name: propertyValue });  
        }  
        
        return res.status(HttpStatus.OK).json(categories)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/action/types/:crossID')
    async indexActionTypeList(@Res() res, @Param('crossID') crossID): Promise<[]>{
        
        if(!mongoose.isValidObjectId(crossID)){
            throw new HttpException('Invalid modelID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const cross = await this.crossService.findById(crossID);
        const modelID = cross.model;
        const modelAttributes = await this.modelAttributeService.findByModelId(modelID);
        const actionTypes = [];
        var services = [];

        for(let offlineService of cross.offline_services){
            services.push(offlineService);
        }
        for(let onlineService of cross.online_services){
            if(!services.find(s => s.name == onlineService.name)){
                services.push(onlineService);
            }
        }

        for (const [propertyKey, propertyValue] of Object.entries(ActionType)) {  
            if (!Number.isNaN(Number(propertyKey))) {  
                continue;  
            }  
            let service = services.find(service => service.name == propertyKey);

            if(service){
                let actionType = { id: propertyKey, name: propertyValue, parameters: {} };

                // Define all parameters using the ActionParameters Schema for each
                ActionParametersSchema.eachPath((pathname, schematype) => {
                    if(pathname != '_id') {
                        var defaultValue = schematype['defaultValue'];
                        var attributeService = modelAttributes.find(ma => ma.type_attribute == pathname && ma.type_service == propertyKey);
                        
                        if(attributeService){
                            if(!attributeService.available_options.find(opt => opt.id.toString() == defaultValue.toString()) && attributeService.available_options.length > 0) defaultValue = attributeService.available_options[0].id;
                        }
                        // Define accepted parameters list for types: 'text'
                        if(['text'].includes(propertyKey)) {
                            if(pathname != 'animation' && pathname != 'img' && pathname != 'path') {
                                if(schematype['instance'] === 'String')  actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Number') actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Boolean') actionType.parameters[pathname] = defaultValue;
                            }
                        }
    
                        // Define accepted parameters list for types: 'temperature', 'humidity', 'time' and 'date'
                        if(['temperature', 'humidity', 'time', 'date', 'weather'].includes(propertyKey)) {
                            if(pathname !== 'message' && pathname !== 'animation' && pathname != 'img' && pathname != 'path') {
                                if(schematype['instance'] === 'String')  actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Number') actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Boolean') actionType.parameters[pathname] = defaultValue;
                            }
                        }
    
                        // Define accepted parameters list for types: 'saints'
                        if(['saints'].includes(propertyKey)) {
                            if(pathname !== 'message' && pathname !== 'animation' && pathname != 'url' && pathname != 'img' && pathname != 'path') {
                                if(schematype['instance'] === 'String')  actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Number') actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Boolean') actionType.parameters[pathname] = defaultValue; 
                            }
                        }
    
                        // Define accepted parameters list for types: 'animation'
                        else if(['animation'].includes(propertyKey)) {
                            if(pathname === 'animation' || pathname === 'color' || pathname === 'path' ) {
                                if(schematype['instance'] === 'String')  actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Number') actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Boolean') actionType.parameters[pathname] = defaultValue; 
                            }
                        }
    
                        // Define accepted parameters list for types: 'image'
                        if(['image'].includes(propertyKey)) {
                            if(pathname === 'pause' || pathname === 'img' || pathname === 'path') {
                                if(schematype['instance'] === 'String')  actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Number') actionType.parameters[pathname] = defaultValue;
                                else if(schematype['instance'] === 'Boolean') actionType.parameters[pathname] = defaultValue; 
                            }                    
                        }
                    }
                })            
    
                actionTypes.push(actionType);  
            }
            
        }
        
        return res.status(HttpStatus.OK).json(actionTypes)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:sequenceID')
    async view(@Res() res, @Param('sequenceID') sequenceID): Promise<Sequence>{
    
        if(!mongoose.isValidObjectId(sequenceID)){
            throw new HttpException('Invalid sequenceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const sequence = await this.sequenceService.findById(sequenceID);
        
            if(!sequence) {
                throw new NotFoundException('Sequence Does not exists.');
            }
            return res.status(HttpStatus.OK).json(sequence)
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('/:sequenceID')
    async update(@Res() res, @Param('sequenceID') sequenceID, @Body() sequence): Promise<Sequence>{

        if(!mongoose.isValidObjectId(sequenceID)){
            throw new HttpException('Invalid sequenceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            // Add _id for each new action 
            if(sequence.actions.length > 0) {
                for(let action of sequence.actions) {
                    if(!action._id) action._id = new ObjectId()
                }
            }    

            const updatedSequence = await this.sequenceService.update(sequenceID, sequence);
            
            if(!updatedSequence) {
                throw new NotFoundException('Sequence Does not exists.');
            }

            const weekly = await this.crossService.getWeekly(sequence.id_cross);
            const calendar = await this.crossService.getCalendar(sequence.id_cross);

            var sendToCross = false;
            for(let day of weekly){
                if (day['sequences'].some(e => e.id_sequence.toString() === updatedSequence['_id'].toString())) {
                    sendToCross = true;
                }
            }
            for(let cal of calendar){
                if (cal.sequences.some(e => e._id.toString() === updatedSequence['_id'].toString())) {
                    sendToCross = true;
                }
            }
            //check mode, send to mode enpoint if mode != normal
            if(sendToCross){
                this.crossService.sendCrossData(sequence.id_cross);
            }

            const cross = await this.crossModel.findById(new ObjectId(sequence.id_cross));

            if(cross.mode != Mode.normal){
                let category = null;
                if (cross.mode == Mode.guardia) category = Object.keys(SequenceCategory)[Object.values(SequenceCategory).indexOf(SequenceCategory.on_guard)];
                if (cross.mode == Mode.cerrado) category = Object.keys(SequenceCategory)[Object.values(SequenceCategory).indexOf(SequenceCategory.holiday)];
                const sequences = await this.sequenceService.findDefaultSequencesByCategory(cross._id, category);
                
                if (sequences.some(e => e['_id'].toString() === updatedSequence['_id'].toString())) {
                    this.crossService.sendSequences(cross);
                }
            }
            
            return res.status(HttpStatus.OK).json(sequence);
        }
    }

    @Post('/image')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: path.join(process.cwd(), AppConstants.ASSETS_TECNEPLAS_DIRECTORY),
            filename: TecneplasHelper.generateRandomFileName,
        }),
    }))
    async uploadImage(@Res() res, @UploadedFile(ImagePipe) file){
        var filePath = 'assets/uploads/tecneplas' + `/${file.filename}`;
        return res.status(HttpStatus.OK).json(filePath);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('/:sequenceID')
    async deleteSequence(@Res() res, @Param('sequenceID') sequenceID): Promise<Sequence>{

        if(!mongoose.isValidObjectId(sequenceID)){
            throw new HttpException('Invalid sequenceID.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        else{
            const deletedSequence = await this.sequenceService.delete(sequenceID);
        
            if(!deletedSequence) 
            {
                throw new NotFoundException('Sequence does not exists.');
            }
            return res.status(HttpStatus.OK).json(
                deletedSequence
            )
        }
    }
}