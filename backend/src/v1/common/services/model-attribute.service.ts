import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelAttribute, ModelAttributeDocument } from '../schemas/model-attribute.schema';

@Injectable()
export class ModelAttributeService {
    constructor(@InjectModel('ModelAttribute') private readonly modelAttribute: Model<ModelAttributeDocument>) {}

    async findAll(): Promise<ModelAttribute[]>{
        return await this.modelAttribute.find();
    }

    async findById(modelAttributeID: string): Promise<ModelAttribute>{
        return await this.modelAttribute.findById(modelAttributeID);
    }

    async findByModelId(productModelID: string): Promise<ModelAttribute[]>{
        return await this.modelAttribute.find({ id_model:productModelID })
    }

    async create(CreateModelAttributeDTO): Promise<ModelAttribute>{
        const modelAttribute = new this.modelAttribute(CreateModelAttributeDTO);
        return await modelAttribute.save();
    }

    async delete(modelAttributeID: string): Promise<ModelAttribute>{
        return await this.modelAttribute.findByIdAndDelete(modelAttributeID);
    }

    async deleteByModelId(productModelID: string): Promise<any>{
        return await this.modelAttribute.deleteMany({ id_model:productModelID });
    }

    async update(modelAttributeID: string, modelAttribute): Promise<ModelAttribute>{
        return await this.modelAttribute.findByIdAndUpdate(modelAttributeID, modelAttribute, {new: true});
    }

    async findOne(modelAttributeID: string): Promise<ModelAttribute>{
        return await this.modelAttribute.findOne({_id: modelAttributeID});
    }
    async addMask(modelAttributeID, masks): Promise<ModelAttribute>{
        const modelAttribute = await this.modelAttribute.findByIdAndUpdate(modelAttributeID, {$set: {masks: masks}}, {new: true});
        return modelAttribute;
    }
}
