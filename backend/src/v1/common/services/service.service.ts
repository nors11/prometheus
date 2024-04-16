import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from '../schemas/service.schema';

const ObjectId = require('mongoose').Types.ObjectId;

@Injectable()
export class ServiceService {
    constructor(@InjectModel('Service') private readonly serviceModel: Model<ServiceDocument>) {}

    async findAll(): Promise<Service[]>{
        
        const aggregations = [
            {
                $lookup: {
                    from: 'attributes',
                    localField: 'available_attributes',
                    foreignField: '_id',
                    as: 'available_attributes'
                },
            }
        ];
        
        return await this.serviceModel.aggregate(aggregations);
    }
    
    async find(filter: FilterQuery<ServiceDocument>): Promise<Service[]>{
        return await this.serviceModel.find(filter);
    }
    
    async findById(serviceID: string): Promise<Service[]>{
        const aggregations = [
            { $match: { _id:new ObjectId(serviceID) } },
            {
                $lookup: {
                    from: 'attributes',
                    localField: 'available_attributes',
                    foreignField: '_id',
                    as: 'available_attributes'
                },
            }
        ];
        
        const service = await this.serviceModel.aggregate(aggregations);
        return service[0];
    }

    async create(CreateserviceDTO): Promise<Service>{
        const service = new this.serviceModel(CreateserviceDTO);
        return await service.save();
    }

    async delete(serviceID: string): Promise<Service>{
        return await this.serviceModel.findByIdAndDelete(serviceID);
    }

    async update(serviceID: string, service): Promise<Service>{
        return await this.serviceModel.findByIdAndUpdate(serviceID, service, {new: true});
    }
}