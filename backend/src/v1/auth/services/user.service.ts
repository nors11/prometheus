import { Model } from 'mongoose';
import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../interfaces/user.interface';
import { CreateUserDTO } from '../dto/user.dto';
import { UserRole } from '../schemas/user.schema';
import { AppConstants } from '../../../app.constants';
import { I18nService } from 'nestjs-i18n';
import { ForgottenPasswordService } from './forgottenpassword.service';
import * as bcrypt from 'bcrypt';

const ObjectId = require('mongoose').Types.ObjectId;

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private forgottenPasswordService: ForgottenPasswordService,
        private i18n: I18nService
    ) { }

    async findAll(query?): Promise<User[]> {
        if(Object.keys(query).length != 0) {
            const aggregations = this.userModel.aggregate();
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
            return await aggregations.exec();
        }else{
            return await this.userModel.find();
        }        
    }

    async findById(userID: string): Promise<User> {
        const user = await this.userModel.findById(userID);
        return user;
    }

    async findByDistributor(id_distributor: string): Promise<User[]> {
        const user = await this.userModel.find({ id_distributor: id_distributor });
        return user;
    }

    async findUsersByPharmacy(id_pharmacy: string, query?): Promise<User[]> {
        const aggregations = this.userModel.aggregate();

        if (Object.keys(query).length != 0) {
            for (let i in query) {
                if (i === 'name_surnames') {
                    aggregations.append(
                        {
                            $project: {
                                name: 1,
                                name_surnames: { $concat: [{ $ifNull: ["$name", ""] }] }
                            }
                        }
                    );
                    aggregations.append({ $match: { name_surnames: new RegExp(query[i], 'i') } });
                }
                else {
                    let param = {};
                    param[i] = new RegExp(query[i], 'i');
                    aggregations.append({ $match: param });
                }
            }
        }

        aggregations.append(
            {
                $match: { id_pharmacy:new ObjectId(id_pharmacy) }
            }
        );

        const pharmacies = await aggregations.exec();

        return await pharmacies;

    }

    async count(query?): Promise<number> {
        const countUser = await this.userModel.countDocuments(query);
        return countUser;
    }

    async create(CreateUserDTO): Promise<User> {
        const user = new this.userModel(CreateUserDTO);
        return await user.save();
    }

    async delete(userID: string): Promise<User> {
        const deletedUser = await this.userModel.findByIdAndDelete(userID);
        if(deletedUser){
            const email = deletedUser.email;
            await this.forgottenPasswordService.deleteOne({email: email});
        }
        
        return deletedUser;
    }

    async update(userID: string, createUserDTO: CreateUserDTO): Promise<User> {
        const updatedUser = await this.userModel.findByIdAndUpdate(userID, createUserDTO, { new: true });
        return updatedUser;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const findByEmail = await this.userModel.findOne({ email });

        return findByEmail;
    }

    async findRole(user: User): Promise<User> {

        const pipeline = [{ $match: { _id:new ObjectId(user._id) } }, { $limit: 1 }];
        const aggregations = this.userModel.aggregate(pipeline);

        if (user.role === UserRole.distributor) {
            aggregations.append(
                {
                    $lookup: {
                        from: 'distributors',
                        localField: 'id_distributor',
                        foreignField: '_id',
                        as: 'distributor'
                    },
                },
                { $unwind: "$distributor" }
            );
        }

        if (user.role === UserRole.pharmacy) {
            aggregations.append(
                {
                    $lookup: {
                        from: 'pharmacies',
                        let: { id_pharmacy: '$id_pharmacy' },
                        as: 'pharmacy',
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$id_pharmacy'] } } },
                            {
                                $lookup: {
                                    from: 'distributors',
                                    let: { id_distributor: '$id_distributor' },
                                    as: 'distributor',
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$id_distributor'] } } },
                                    ]
                                }
                            }
                        ]
                    },
                },
                { $unwind: "$pharmacy" }
            );
        }

        const account = await aggregations.exec();

        return await account[0];
    }

    async register(createUserDTO: CreateUserDTO): Promise<User> {
        if (await this.findByEmail(createUserDTO.email)) {
            throw new BadRequestException(await this.i18n.translate('auth.EMAIL_USER_EXISTS', { lang: AppConstants.DEFAULT_LANGUAGE }));
        }
        const user = new this.userModel(createUserDTO);
        return await user.save();
    }

    async setPassword(email: string, password: string): Promise<boolean> {
        const user = await this.findByEmail(email);
        if (!user) throw new HttpException(await this.i18n.translate('auth.USER_NOT_FOUND', { lang: AppConstants.DEFAULT_LANGUAGE }), HttpStatus.NOT_FOUND);

        const passwordEncrypted = await bcrypt.hash(password, 10);
        await this.userModel.findOneAndUpdate({ _id: user['_id'] }, { password: passwordEncrypted });

        return true;
    }
}
