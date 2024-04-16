import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Distributor, DistributorDocument } from '../schemas/distributor.schema';


@Injectable()
export class DistributorService {
    constructor(@InjectModel('Distributor') private readonly distributorModel: Model<DistributorDocument>) {}

    async findAll(query?): Promise<Distributor[]>{

        if(Object.keys(query).length != 0) {
            const aggregations = this.distributorModel.aggregate();
            for(let i in query){
                if(i === 'name_surnames') {
                    aggregations.append(
                        { $project: {
                                name: 1,
                                name_surnames: { $concat:[ { $ifNull: [ "$name", "" ] }] }
                            }
                        }
                    );
                    aggregations.append({ $match: { name_surnames: new RegExp(query[i], 'i')} } );
                }
                else {
                    let param = {};
                    param[i] = new RegExp(query[i], 'i');
                    aggregations.append({ $match: param } );
                }
            }
            const distributors = await aggregations.exec();
            return distributors;
        }
        else{
            const distributors = await this.distributorModel.find();
            return distributors;
        }
        
    }
    
    async count(query?): Promise<number> {
        const countDistributors = await this.distributorModel.countDocuments(query);
        return countDistributors;
    }

    async findById(distributorID: string): Promise<Distributor>{
        return await this.distributorModel.findById(distributorID);
    }

    async create(CreatedistributorDTO): Promise<Distributor>{
        const distributor = new this.distributorModel(CreatedistributorDTO);
        return await distributor.save();
    }

    async delete(distributorID: string): Promise<Distributor>{
        return await this.distributorModel.findByIdAndDelete(distributorID);
    }

    async update(distributorID: string, distributor): Promise<Distributor>{
        return await this.distributorModel.findByIdAndUpdate(distributorID, distributor, {new: true});
    }
}
