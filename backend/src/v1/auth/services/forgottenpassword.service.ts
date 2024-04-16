import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ForgottenPassword, ForgottenPasswordDocument } from '../schemas/forgotten-password.schema';

@Injectable()
export class ForgottenPasswordService {
    constructor(
        @InjectModel(ForgottenPassword.name) private readonly forgottenPasswordModel: Model<ForgottenPasswordDocument>
    ) {}

    async count(criteria?: FilterQuery<ForgottenPasswordDocument>): Promise<number>{
        return await this.forgottenPasswordModel.countDocuments(criteria);
    }

    async findOne(filter): Promise<ForgottenPassword>{
        return await this.forgottenPasswordModel.findOne(filter);
    }

    async findAll(): Promise<ForgottenPassword[]>{
        return await this.forgottenPasswordModel.find();
    }

    async findOneAndUpdate(filter, update): Promise<ForgottenPassword>{
        return await this.forgottenPasswordModel.findOneAndUpdate( filter, update, { upsert: true, new: true } );
    }

    async delete(forgottenPasswordID: string): Promise<ForgottenPassword>{
        return await this.forgottenPasswordModel.findByIdAndDelete(forgottenPasswordID);
    }
    async deleteOne(filter): Promise<any>{
        return await this.forgottenPasswordModel.findOneAndDelete(filter);
    }
}