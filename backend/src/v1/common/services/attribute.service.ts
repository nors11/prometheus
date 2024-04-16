import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Attribute, AttributeDocument, AttributeOption } from '../schemas/attribute.schema';


@Injectable()
export class AttributeService {
    constructor(
        @InjectModel('Attribute') private readonly attributeModel: Model<AttributeDocument>
    ) {}

    async count(query?): Promise<number> {
        const countDistributors = await this.attributeModel.countDocuments(query);
        return countDistributors;
    }

    async findAll(): Promise<Error[]>{
        return await this.attributeModel.find();
    }
    
    async findAllOptionsByType(type:string): Promise<AttributeOption[]>{
        const attributeType = await this.attributeModel.findOne({ type:type });
        return (attributeType?.options.length > 0) ? attributeType.options : [];
    }

    async findById(distributorID: string): Promise<Attribute>{
        return await this.attributeModel.findById(Attribute);
    }

    async create(CreateattributeDTO): Promise<Attribute>{
        const attribute = new this.attributeModel(CreateattributeDTO);
        return await attribute.save();
    }

    async createAttributeOptionByType(type:string, attributeOption:AttributeOption) {
        let attributeType = await this.attributeModel.findOne({ type:type });
        const lastOption = attributeType.options.slice(-1)[0];
        
        attributeOption.id = (attributeType.options.slice(-1).length > 0) ? (Number(lastOption.id)+1).toString() : '1';
        attributeType.options.push(attributeOption);
        
        return await this.attributeModel.findByIdAndUpdate(attributeType.id, attributeType, {new: true});
    }

    async delete(attributeID: string): Promise<Attribute>{
        return await this.attributeModel.findByIdAndDelete(attributeID);
    }

    async update(attributeID: string, attribute): Promise<Attribute>{
        return await this.attributeModel.findByIdAndUpdate(attributeID, attribute, {new: true});
    }
}
