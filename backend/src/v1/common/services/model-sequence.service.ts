import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelSequence } from '../schemas/model-sequence.schema';
import { DefaultSequence, DefaultSequenceDocument } from '../schemas/default-sequence.schema';
import { ModelSequenceDocument } from '../schemas/model-sequence.schema';
import { Attribute, AttributeDocument } from '../schemas/attribute.schema';
import { Sequence, SequenceCategory, SequenceDocument } from '../schemas/sequence.schema';
import { ActionType } from '../schemas/action.schema';
import { AppConstants } from '../../../app.constants';

const ObjectId = require('mongoose').Types.ObjectId;

@Injectable()
export class ModelSequenceService {
    constructor(
        @InjectModel(DefaultSequence.name) private readonly defaultSequenceModel: Model<DefaultSequenceDocument>,
        @InjectModel(Attribute.name) private readonly attributeModel: Model<AttributeDocument>,
        @InjectModel(ModelSequence.name) private readonly modelSequence: Model<ModelSequenceDocument>,
        @InjectModel(Sequence.name) private readonly sequenceModel: Model<SequenceDocument>
    ) {}

    async generateDefaultSequences(modelAttributes, productModelID?:string){
        let defaultSequences = (!productModelID) ? await this.defaultSequenceModel.find() : await this.findByModelId(productModelID);
        
        var categories = [];
        var optionsDbAttribute = await this.attributeModel.findOne({ 'type': 'other'});
        var otherOptions = optionsDbAttribute.options;
      
        for (const [propertyKey, propertyValue] of Object.entries(SequenceCategory)) {  
            if (!Number.isNaN(Number(propertyKey))) {  
                continue;  
            }  
            categories.push({ category: propertyKey, name: propertyValue, list: [] });
        }
        
        for (let sequence of defaultSequences) {
            var newSequence = new ModelSequence();
            if(productModelID) newSequence['_id'] = sequence['_id'];
            newSequence.default = true;
            newSequence.actions = [];
            newSequence.name = sequence.name;
            for(let action of sequence.actions){
                var modelService = modelAttributes.filter(modelAtt =>modelAtt.type_service == action.type.toString()); //ARRAY amb les relacions de la acció
                if(modelService.length > 0){
                    Object.keys(action.parameters).forEach(key =>{
                        if(key != 'path'){
                            var attributeType = modelService.find(ms => ms.type_attribute == key);
    
                            if(otherOptions.find(otherOpt => otherOpt.id.toString() == key)){
                                attributeType = modelService.find(ms => ms.type_attribute == 'other');
                                if(!attributeType || !attributeType.available_options.find(option => option.id.toString() == key)){
                                    action.parameters[key] = false;
                                }
                            } 
                            else if(attributeType && attributeType.available_options.length > 0){
                                if(!attributeType.available_options.find(option => option.id.toString() === action.parameters[key].toString())){
                                    action.parameters[attributeType.type_attribute] = parseInt(attributeType.available_options[0].id);
                                }
                            }
                        }
                    });
                    
                    if(action.type ==  Object.keys(ActionType).find(key => key === 'animation')){
                        var attributeType = modelService.find(ms => ms.type_attribute == 'animation');
                        var option = attributeType.available_options.find(av => av.id == action.parameters.animation);
                        action.parameters.path = AppConstants.BACKEND_URL + option.path;
                    }
                    newSequence.actions.push(action);

                }
            }
            newSequence.category = sequence.category;

            if(newSequence.actions.length > 0){
                categories[categories.findIndex(c => c.category === newSequence.category)].list.push(newSequence);
            }
        }
        return categories;
    }

    async createBatch(sequences:ModelSequence[]) {
        for(let sequence of sequences) {
            for(let action of sequence.actions) {
                if(!action['_id']) action['_id'] = new ObjectId();
            }
        }

        return await this.modelSequence.insertMany(sequences);
    }

    async findByModelId(productModelID: string): Promise<ModelSequence[]>{
        return await this.modelSequence.find({ id_model:productModelID })
    }

    async deleteByModelId(productModelID: string): Promise<any>{
        return await this.modelSequence.deleteMany({ id_model:productModelID });
    }

    async fixAnimations(){
        var sequences = await this.sequenceModel.find();
        var attributes = await this.attributeModel.findOne({type: 'animation'});
        var modelSequences = await this.modelSequence.find();

        for(let sequence of sequences){
            var sequenceModified = false;
            for(let action of sequence.actions){
                if(action.type == Object.keys(ActionType).find(key => key === 'animation')){
                    var option = attributes.options.find(att => parseInt(att.id) == parseInt(action.parameters.animation) );
                    if(option && option.path) {
                        action.parameters.path = AppConstants.BACKEND_URL + option.path;
                        sequenceModified = true;
                    }
                }
            }
            if(sequenceModified){
                await this.sequenceModel.findByIdAndUpdate(sequence._id, sequence);
            }
        }
        for(let modelSequence of modelSequences){
            var sequenceModified = false;
            for(let action of modelSequence.actions){
                if(action.type == Object.keys(ActionType).find(key => key === 'animation')){
                    var option = attributes.options.find(att => parseInt(att.id) == parseInt(action.parameters.animation) );
                    if(option && option.path) {
                        action.parameters.path = AppConstants.BACKEND_URL + option.path;
                        sequenceModified = true;
                    }
                }
            }
            if(sequenceModified){
                await this.modelSequence.findByIdAndUpdate(modelSequence._id, modelSequence);
            }
        }
        
        return 'Animations fixed.';
    }
}
