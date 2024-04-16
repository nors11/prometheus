import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, ErrorDocument } from '../schemas/error.schema';

@Injectable()
export class ErrorService {
    constructor(@InjectModel('Error') private readonly errorModel: Model<ErrorDocument>) {}

    async findAll(): Promise<Error[]>{
        return await this.errorModel.find();
    }

    async findById(errorID: string): Promise<Error>{
        return await this.errorModel.findById(errorID);
    }

    async create(CreateErrorDTO): Promise<Error>{
        const error = new this.errorModel(CreateErrorDTO);
        return await error.save();
    }

    async delete(errorID: string): Promise<Error>{
        return await this.errorModel.findByIdAndDelete(errorID);
    }

    async update(errorID: string, error): Promise<Error>{
        return await this.errorModel.findByIdAndUpdate(errorID, error, {new: true});
    }
}
