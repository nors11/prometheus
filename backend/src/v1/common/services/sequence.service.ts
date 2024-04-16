import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sequence, SequenceCategory, SequenceDocument } from '../schemas/sequence.schema';
import { AppConstants } from '../../../app.constants';
import { ProductModel, ProductModelDocument } from '../schemas/product-model.schema';
import { Cross, CrossDocument } from '../schemas/cross.schema';

const ObjectId = require('mongoose').Types.ObjectId;

enum SortDirection {
    Ascending = 1,
    Descending = -1
}
@Injectable()
export class SequenceService {
    constructor(
        @InjectModel('Sequence') private readonly sequenceModel: Model<SequenceDocument>,
        @InjectModel(Cross.name) private readonly productModel: Model<CrossDocument>,
        @InjectModel(ProductModel.name) private readonly productModelModel: Model<ProductModelDocument>,
    ) {}

    async findAll(): Promise<Sequence[]>{
        return await this.sequenceModel.find();
    }

    async findById(sequenceID: string): Promise<Sequence>{
        return await this.sequenceModel.findById(sequenceID);
    }

    async findOne(filter: FilterQuery<SequenceDocument>): Promise<Sequence>{
        return await this.sequenceModel.findOne(filter);
    }

    async create(CreatesequenceDTO, productModel?): Promise<Sequence>{
        if(typeof CreatesequenceDTO.id_cross != 'object') CreatesequenceDTO.id_cross =new ObjectId(CreatesequenceDTO.id_cross);
        
        
        var sequence = new this.sequenceModel(CreatesequenceDTO);
        if(productModel){
            productModel = await this.productModelModel.findById(new ObjectId(productModel));
        }
        else{
            productModel = await this.findModelByCrossId(sequence.id_cross);
        }
        for(let action of sequence.actions){
            if(action.parameters['font_size'] && !action.parameters['led']) action.parameters['led'] = this.calculateLedPosition(action.parameters.row, action.parameters.font_size, productModel);
        }
        return await sequence.save();
    }

    async delete(sequenceID: string): Promise<Sequence>{
        return await this.sequenceModel.findByIdAndDelete(sequenceID);
    }

    async update(sequenceID: string, sequence): Promise<Sequence>{
        const model = await this.findModelByCrossId(sequence.id_cross);
        for(let action of sequence.actions){
            if(action.parameters['font_size'] && !action.parameters['led']) action.parameters['led'] = this.calculateLedPosition(action.parameters.row, action.parameters.font_size, model);
        }
        return await this.sequenceModel.findByIdAndUpdate(sequenceID, sequence, {new: true});
    }

    async getSequencesGroupedByCategory(crossId: string): Promise<Sequence[]>{
        const aggregations = [
            { $match: { id_cross:new ObjectId(crossId) } },
            { $sort: { name: SortDirection.Ascending } },
            {
                $group: {
                    _id: "$category",
                    list: { "$push": "$$ROOT" }
                }
            },
            { $sort: {"_id": SortDirection.Ascending } },
            { $project: {   _id: 0, 
                            name: { 
                                $arrayElemAt: [ Object.values(SequenceCategory), { $indexOfArray : [ Object.keys(SequenceCategory), "$_id" ] } ] 
                            }, 
                            category: "$_id", 
                            list: "$list"
                        } 
            },
        ];
        
        return await this.sequenceModel.aggregate(aggregations);
    }
    
    async findDefaultSequencesByCategory(crossId: string, category: string): Promise<Sequence[]>{
        return await this.sequenceModel.find({id_cross:new ObjectId(crossId), category: category, default: true});
    }

    async findModelByCrossId(crossId): Promise<ProductModel>{
        const pipeline = [ { $match: { _id:new ObjectId(crossId)} } ];
        const aggregations = this.productModel.aggregate(pipeline);
        aggregations.append(
            {
                $lookup: {
                    from: 'product_models',
                    localField: 'model',
                    foreignField: '_id',
                    as: 'model'
                }
            },
            { $unwind: "$model" },
        );
        const cross = await aggregations.exec();
        
        return cross[0].model;
    }
    
    calculateLedPosition(row, fontSize, model){
        const height = model.central_panel.height;

        var table = [];
        var totalRows = 0;
        for (const [key, font] of Object.entries(AppConstants.FONTSIZE)) {
            let rows = Math.floor(height / font);
            var divisions = Math.floor(height / font);
            var rest = Math.floor((height - (divisions * font))/2);
            
            var col = [];
            var ledPosition = 1 + rest;
            for(let i = 1; i <= rows; i++){
                var rowNum = totalRows + i;
                var ledFi = Math.floor((ledPosition + font) - 1);
                col.push({rowId: rowNum, led: ledPosition, ledFi: ledFi});

                ledPosition = Math.floor(ledPosition + font);
            }
            if(col.length > 0) table.push(col);
            
            totalRows = totalRows + rows;
        }

        for(let column of table){            
            for(let [index, tableRow] of column.entries()){
                if(tableRow.rowId == row){
                    var range = { ledInit: tableRow.led, ledFi: tableRow.ledFi}
                    let space = range.ledFi - range.ledInit + 1;
                    return tableRow.led + Math.floor((space - AppConstants.FONTSIZE[fontSize]) / 2);
                }
            }
        }
    }
}
