import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Timezone, TimezoneDocument } from '../schemas/timezone.schema';


@Injectable()
export class TimezoneService {
    constructor(@InjectModel('Timezone') private readonly timezoneModel: Model<TimezoneDocument>) {}

    async findAll(): Promise<Timezone[]>{
        return await this.timezoneModel.find();
    }

    async findById(timezoneID: string): Promise<Timezone>{
        return await this.timezoneModel.findById(timezoneID);
    }

    async create(CreatetimezoneDTO): Promise<Timezone>{
        const service = new this.timezoneModel(CreatetimezoneDTO);
        return await service.save();
    }

    async delete(timezoneID: string): Promise<Timezone>{
        return await this.timezoneModel.findByIdAndDelete(timezoneID);
    }

    async update(timezoneID: string, timezone): Promise<Timezone>{
        return await this.timezoneModel.findByIdAndUpdate(timezoneID, timezone, {new: true});
    }
}