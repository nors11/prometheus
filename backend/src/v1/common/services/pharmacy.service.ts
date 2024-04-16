import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pharmacy, PharmacyDocument } from '../schemas/pharmacy.schema';
import { UserService } from '../../auth/services/user.service';

const ObjectId = require('mongoose').Types.ObjectId;

@Injectable()
export class PharmacyService {
    constructor(
        @InjectModel('Pharmacy') private readonly pharmacyModel: Model<PharmacyDocument>,
        private userService: UserService
    ) {}

    async count(query?): Promise<number> {
        const countPharmacies = await this.pharmacyModel.countDocuments(query);
        return countPharmacies;
    }

    async findAll(query?): Promise<Pharmacy[]>{
        const aggregations = this.pharmacyModel.aggregate();

        if(Object.keys(query).length != 0) {
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
        }
        
        aggregations.append( 
        {
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creator'
            }
        },
        { $unwind: "$creator" },
        { 
            $lookup: {
                from: 'crosses',
                localField: '_id',
                foreignField: 'id_pharmacy',
                as: 'crosses'
            },
        });

        const pharmacies = await aggregations.exec();

        return await pharmacies;
    }
    async findAllByDistributor(id_distributor): Promise<Pharmacy[]>{
        const aggregations = this.pharmacyModel.aggregate();

        aggregations.append(
            {
                 $match: { id_distributor:new ObjectId(id_distributor) } 
            },
            { 
                $lookup: {
                    from: 'users',
                    localField: 'creator',
                    foreignField: '_id',
                    as: 'creator'
                },
            },
            { $unwind: "$creator" }
        );

        return await aggregations.exec();
    }

    async findById(pharmacyID: string): Promise<Pharmacy>{

        const pipeline = [ { $match: { _id:new ObjectId(pharmacyID)} } ];
        const aggregations = this.pharmacyModel.aggregate(pipeline);

        aggregations.append(
                { 
                    $lookup: {
                        from: 'distributors',
                        localField: 'id_distributor',
                        foreignField: '_id',
                        as: 'distributors'
                    },
                },
            { $unwind: "$creator" }
        );

        aggregations.append(
                { 
                    $lookup: {
                        from: 'users',
                        localField: 'creator',
                        foreignField: '_id',
                        as: 'creator'
                    },
                },
            { $unwind: "$creator" }
        );

        const pharmacy = await aggregations.exec();

        return pharmacy[0];
    }

    async create(CreatepharmacyDTO): Promise<Pharmacy>{
        const pharmacy = new this.pharmacyModel(CreatepharmacyDTO);
        return await pharmacy.save();
    }

    async delete(pharmacyID: string): Promise<Pharmacy>{
        return await this.pharmacyModel.findByIdAndDelete(pharmacyID);
    }

    async update(pharmacyID: string, pharmacy): Promise<Pharmacy>{
        return await this.pharmacyModel.findByIdAndUpdate(pharmacyID, pharmacy, {new: true});
    }

    async countUsersByPharmacy(pharmacyID: string): Promise<number>{
        return await this.userService.count({id_pharmacy: pharmacyID});
    }
}
