import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductModel, ProductModelDocument, Mask } from '../schemas/product-model.schema';
import { CreateProductModelDTO } from '../dto/product-model.dto';
import { CrossDocument } from '../schemas/cross.schema';
import { Service } from '../schemas/service.schema';

const ObjectId = require('mongoose').Types.ObjectId;

@Injectable()
export class ProductModelService {
    constructor(
        @InjectModel('ProductModel') private readonly productModel: Model<ProductModelDocument>
    ) {}

    async findAll(query?): Promise<ProductModel[]>{
        const aggregations = this.productModel.aggregate();

        if(Object.keys(query).length != 0) {    
            for(let i in query){
                let param = {};
                param[i] = new RegExp(query[i], 'i');
                aggregations.append({ $match: param } );
            }            
        }

        aggregations.append(
            {
                $lookup: {
                    from: 'crosses', 
                    let: { model: '$_id' }, 
                    as: 'crosses', 
                    pipeline: [ 
                        { $match: { $expr: { $eq: ['$model', '$$model' ] } } },
                        { $group : { _id:"$_id" }}
                    ]
                },
            },
            {
                $lookup: {
                    from: 'services',
                    let: { online_services: { $ifNull: ['$online_services', [] ] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$online_services'] } } },
                    ],
                    as: 'online_services'
                },
            },
            {
                $lookup: {
                    from: 'services',
                    let: { offline_services: { $ifNull: ['$offline_services', [] ] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$offline_services'] } } },
                    ],
                    as: 'offline_services'
                },
            },
            { $addFields: { "countCross": { $size: "$crosses" } } },
            { $unset: "crosses" }
          )
        
        return await aggregations.exec();        
    }

    async findById(productModelID: string): Promise<ProductModel>{
        const pipeline = [ { $match: { _id:new ObjectId(productModelID)} } ];
        const aggregations = this.productModel.aggregate(pipeline);
        aggregations.append(
            {
                $lookup: {
                    from: 'services',
                    let: { offline_services: { $ifNull: ['$offline_services', [] ] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$offline_services'] } } },
                        {
                            $lookup: {
                                from: 'attributes',
                                localField: 'available_attributes',
                                foreignField: '_id',
                                as: 'available_attributes'
                            }
                        }
                    ],
                    as: 'offline_services'
                },
            },
            {
                $lookup: {
                    from: 'services',
                    let: { online_services: { $ifNull: ['$online_services', [] ] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$online_services'] } } },
                        {
                            $lookup: {
                                from: 'attributes',
                                localField: 'available_attributes',
                                foreignField: '_id',
                                as: 'available_attributes'
                            }
                        }
                    ],
                    as: 'online_services'
                },
            },
        );
        const model = await aggregations.exec();

        return model[0];
    }

    async create(CreateProductModelDTO: CreateProductModelDTO): Promise<ProductModel>{
        const productModel = new this.productModel(CreateProductModelDTO);
        return await productModel.save();
    }

    async delete(productModelID: string): Promise<ProductModel>{
        return await this.productModel.findByIdAndDelete(productModelID);
    }

    async update(productModelID: string, productModel): Promise<ProductModel>{
        return await this.productModel.findByIdAndUpdate(productModelID, productModel, {new: true});
    }

    async findOne(productModelID: string): Promise<ProductModel>{
        return await this.productModel.findOne({_id: productModelID});        
    }
    async addMask(productModelID, masks): Promise<ProductModel>{
        const productModel = await this.productModel.findByIdAndUpdate(productModelID, {$set: {masks: masks}}, {new: true});
        return productModel;
    }

    async getOfflineServices(productModelID): Promise<Service[]>{
        const pipeline = [ { $match: { _id:new ObjectId(productModelID)} } ];
        const aggregations = this.productModel.aggregate(pipeline);
        aggregations.append(
            {
                $lookup: {
                    from: 'services',
                    let: { offline_services: { $ifNull: ['$offline_services', [] ] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$offline_services'] } } },
                        {
                            $lookup: {
                                from: 'attributes',
                                localField: 'available_attributes',
                                foreignField: '_id',
                                as: 'available_attributes'
                            }
                        }
                    ],
                    as: 'offline_services'
                },
            }
        );
        const model = await aggregations.exec();
        return model[0].offline_services;
    }
    async getOnlineServices(productModelID): Promise<Service[]>{
        const pipeline = [ { $match: { _id:new ObjectId(productModelID)} } ];
        const aggregations = this.productModel.aggregate(pipeline);
        aggregations.append(
            {
                $lookup: {
                    from: 'services',
                    let: { online_services: { $ifNull: ['$online_services', [] ] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$online_services'] } } },
                        {
                            $lookup: {
                                from: 'attributes',
                                localField: 'available_attributes',
                                foreignField: '_id',
                                as: 'available_attributes'
                            }
                        }
                    ],
                    as: 'online_services'
                },
            }
        );
        const model = await aggregations.exec();
        return model[0].online_services;
    }
}
