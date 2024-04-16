import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CrossCalendar, CrossCalendarDocument } from '../schemas/cross-calendar.schema';

const ObjectId = require('mongoose').Types.ObjectId;

enum SortDirection {
    Ascending = 1,
    Descending = -1
}
@Injectable()
export class CrossCalendarService {
    constructor(@InjectModel('CrossCalendar') private readonly crossCalendarModel: Model<CrossCalendarDocument>) {}

    async findAll(): Promise<CrossCalendar[]>{
        return await this.crossCalendarModel.find();
    }

    async findById(crossCalendarID: string): Promise<CrossCalendar>{
        return await this.crossCalendarModel.findById(crossCalendarID);
    }

    async findOne(filter: FilterQuery<CrossCalendarDocument>): Promise<CrossCalendar>{
        return await this.crossCalendarModel.findOne(filter);
    }

    async create(CreateCrossCalendarDTO): Promise<CrossCalendar>{
        if(typeof CreateCrossCalendarDTO.id_cross != 'object') CreateCrossCalendarDTO.id_cross =new ObjectId(CreateCrossCalendarDTO.id_cross);
        if(typeof CreateCrossCalendarDTO.id_sequence != 'object') CreateCrossCalendarDTO.id_sequence =new ObjectId(CreateCrossCalendarDTO.id_sequence);

        const crossCalendar = new this.crossCalendarModel(CreateCrossCalendarDTO);
        return await crossCalendar.save();
    }

    async delete(crossCalendarID: string): Promise<CrossCalendar>{
        return await this.crossCalendarModel.findByIdAndDelete(crossCalendarID);
    }

    async update(crossCalendarID: string, crossCalendar): Promise<CrossCalendar>{
        return await this.crossCalendarModel.findByIdAndUpdate(crossCalendarID, crossCalendar, {new: true});
    }

    async getCrossCalendarByCrossId(crossId: string) {
        const aggregations = [
            { $match: { id_cross:new ObjectId(crossId) } },
            {
                $lookup: {
                    from: 'sequences', 
                    let: { id_sequence: '$id_sequence' }, 
                    as: 'sequence', 
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$id_sequence' ] } } },
                    ]
                }
            },
            { $unwind: '$sequence'},
            {
                $project: {
                    _id: 1, id_cross: 1, id_sequence: 1, date_start: 1, all_day: 1, time_start: 1, time_end: 1, name: '$sequence.name', category: '$sequence.category' 
                }
            },{
                $sort : { date_start: SortDirection.Ascending, time_start: SortDirection.Ascending }
            }
        ];

        return await this.crossCalendarModel.aggregate(aggregations);
    }
}