import { FilterQuery, Model } from 'mongoose';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brightness, Cross, CrossDocument, Mode, OfflineService, OnlineService, Settings } from '../schemas/cross.schema';
import { DefaultWeeklyDays, DefaultWeeklyDaysDocument } from '../schemas/default-weekly.schema';
import { MqttService } from '../services/mqtt.service';
import { SequenceService } from './sequence.service';
import { Sequence, SequenceCategory } from '../schemas/sequence.schema';
import { DefaultSequence, DefaultSequenceDocument } from '../schemas/default-sequence.schema';
import { EmqxAuthRules, EmqxAuthRulesDocument, Topics } from '../schemas/emqxauthrules.schema';
import { PharmacyDocument } from '../schemas/pharmacy.schema';
import { Service, ServiceDocument, Type } from '../schemas/service.schema';
import { OnlineServicesService } from '../services/online-services.service';
import { UserRole } from 'src/v1/auth/schemas/user.schema';
import { OnlineServices, OnlineServicesDocument } from '../schemas/online-services.schema';
import { ProductModel, ProductModelDocument } from '../schemas/product-model.schema';
import { ModelSequenceService } from './model-sequence.service';

const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');

enum SortDirection {
    Ascending = 1,
    Descending = -1
}

@Injectable()
export class CrossService {
    constructor(
        @InjectModel(Cross.name) private readonly productModel: Model<CrossDocument>,
        @InjectModel(DefaultWeeklyDays.name) private readonly defaultWeeklyDaysModel: Model<DefaultWeeklyDaysDocument>,
        @InjectModel(DefaultSequence.name) private readonly defaultSequenceModel: Model<DefaultSequenceDocument>,
        @InjectModel(EmqxAuthRules.name) private readonly emqxAuthRulesModel: Model<EmqxAuthRulesDocument>,
        @InjectModel('Pharmacy') private readonly pharmacyModel: Model<PharmacyDocument>,
        @InjectModel(Service.name) private readonly serviceModel: Model<ServiceDocument>,
        @InjectModel(OnlineServices.name) private readonly onlineServicesModel: Model<OnlineServicesDocument>,
        @InjectModel(ProductModel.name) private readonly productModelModel: Model<ProductModelDocument>,
        private mqttService: MqttService,
        private sequenceService: SequenceService,
        @Inject(forwardRef(() => OnlineServicesService))
        private onlineServicesService: OnlineServicesService,
        private modelSequenceService: ModelSequenceService
    ) { }

    async findAll(query?): Promise<Cross[]> {

        const aggregations = this.productModel.aggregate();

        if (query && Object.keys(query).length != 0) {
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
                    $lookup: {
                        from: 'pharmacies',
                        localField: 'id_pharmacy',
                        foreignField: '_id',
                        as: 'pharmacy'
                    },
                },
                { $unwind: "$pharmacy" },
                {
                    $lookup: {
                        from: 'product_models',
                        localField: 'model',
                        foreignField: '_id',
                        as: 'model'
                    },
                },
                { $unwind: "$model" }
        );

        const cross = await aggregations.exec();

        return await cross;
    }

    async findById(crossID: string): Promise<Cross> {

        const pipeline = [ { $match: { _id: new ObjectId(crossID)} } ];
        const aggregations = this.productModel.aggregate(pipeline);

        aggregations.append(
                { 
                    $lookup: {
                        from: 'pharmacies',
                        localField: 'id_pharmacy',
                        foreignField: '_id',
                        as: 'pharmacy'
                    },
                },
                { $unwind: "$pharmacy" },
                {
                    $lookup: {
                        from: 'crosses_calendars',
                        let: { id_calendar: '$calendar' },
                        as: 'crosses_calendars',
                        pipeline: [
                            { $match: { $expr: { $in: ['$_id', '$$id_calendar'] } } }
                        ]
                    }
                }
        );

        const cross = await aggregations.exec();

        return cross[0];
    }

    async findOne(filter: FilterQuery<CrossDocument>): Promise<Cross> {
        return await this.productModel.findOne(filter);
    }

    async create(CreatecrossDTO): Promise<Cross> {
        if(CreatecrossDTO.online_services) CreatecrossDTO.online_services.forEach(service => { if (typeof service['_id'] != 'object') service['_id'] =new ObjectId(service['_id']) });

        const defaultWeeklyDays = await this.defaultWeeklyDaysModel.find();

        var defaultSequences = await this.modelSequenceService.findByModelId(CreatecrossDTO.model);
        var cross = new this.productModel(CreatecrossDTO);

        for (let sequence of defaultSequences) {
            var newSequence = new Sequence();
            newSequence.id_cross = cross._id;
            newSequence.default = true;
            newSequence.actions = sequence.actions;
            newSequence.name = sequence.name;
            newSequence.category = sequence.category;

            await this.sequenceService.create(newSequence, cross.model);
        }

        for (let day of defaultWeeklyDays) {
            for (let seq of day['sequences']) {
                let defaultSequence = await this.defaultSequenceModel.findById(seq['id_sequence']);
                let newSeq = await this.sequenceService.findOne({ name: defaultSequence.name, id_cross: cross._id });

                seq['id_sequence'] = newSeq['_id'];
            }
            cross.weekly.push(day);
        }
        
        await this.generateAuthRules(cross);

        await this.generateCrossServices(cross);
        cross.settings = new Settings();
        cross.settings.temperature = 0;
        cross.settings.timezone = "Europe/Madrid";
        const brightness = new Brightness();
        brightness.brightness = 50;
        brightness.light = 50;
        cross.settings.brightness = [brightness];

        return await cross.save();
    }
    async generateAuthRules(cross){
        await this.emqxAuthRulesModel.deleteOne({ username: cross.number_plate + '@tecneplas.tld', password: cross.number_plate });
        const topics = [];
        for (let topic of Object.values(Topics)) {
            topics.push('tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate + '/' + topic);
        }

        const emqxAuthRulesDTO = { username: cross.number_plate + '@tecneplas.tld', password: cross.number_plate, pubsub: topics };
        const emqxAuthRules = new this.emqxAuthRulesModel(emqxAuthRulesDTO);
        await emqxAuthRules.save();
    }
    async generateCrossServices(cross, online?){
        const services = await this.serviceModel.find();
        const crossProductModel = await this.productModelModel.findById(cross.model);
        cross.offline_services = [];
        if(online) cross.online_services = [];
        for(let service of services){
            if(service.offline && crossProductModel.offline_services.find(s => s.toString() === service._id.toString())){
                let offlineService = new OfflineService();
                offlineService.id_service = service._id;
                offlineService.name = service.name;
                offlineService.active = true;
                offlineService.data = null;
                cross.offline_services.push(offlineService);
            }
            if(online && service.online && crossProductModel.online_services.find(s => s.toString() === service._id.toString())){
                let onlineService = new OnlineService();
                onlineService.id_service = service._id;
                onlineService.name = service.name;
                onlineService.active = true;
                onlineService.data = null;
                cross.online_services.push(onlineService);                
            }
        }
    }

    async delete(crossID: string): Promise<Cross> {
        const cross = await this.productModel.findByIdAndDelete(crossID);
        await this.emqxAuthRulesModel.findOneAndDelete({username: cross.number_plate + '@tecneplas.tld'});
        return cross; 
    }

    async update(crossID: string, cross, updateServices?): Promise<Cross> {
        if(cross.settings && cross.settings.brightness) cross.settings.brightness.sort(this.compare);
        if(cross.calendar){
            for(let calendar of cross.calendar){
                calendar = new mongoose.Types.ObjectId(calendar);
            }
        }        
        
        if(updateServices && cross.model) {
            await this.generateCrossServices(cross, true);
            await this.getOnlineServiceData(cross.id_pharmacy, cross.online_services);
        }
        const updatedCross = await this.productModel.findByIdAndUpdate(crossID, cross, { new: true });
        await this.generateAuthRules(updatedCross ? updatedCross : cross);

        if(cross.hasOwnProperty('operative')){
            let topic = 'tecneplas/' + updatedCross.id_pharmacy + '/' + updatedCross.number_plate + '/operative';
            if (this.mqttService.connected) {
                console.log('Publishing...');
                const data = cross.operative;
                this.mqttService.client.publish(topic, JSON.stringify(data), { qos: 0, retain: true });
                console.log('Published!');
            }
        }
        return updatedCross;
    }

    compare(a, b) {
        const brightnessA = a.light;
        const brightnessB = b.light;

        let comparison = 0;
        if (brightnessA > brightnessB) {
            comparison = -1;
        } else if (brightnessA < brightnessB) {
            comparison = 1;
        }
        return comparison;
    }

    async patchWeekly(crossID: string, weekly: any[]) {
        // Prepare and parse data for saving to the database
        if (weekly.length) {
            for (let week of weekly) {
                week._id =new ObjectId(week._id);
                if (week.sequences.length > 0) {
                    for (let sequence of week.sequences) {
                        sequence.id_sequence =new ObjectId(sequence.id_sequence)

                        if (!sequence.hasOwnProperty('_id') || !sequence._id) sequence._id = new ObjectId();
                        else sequence._id =new ObjectId(sequence._id);
                    }
                }
            }
        }

        return await this.productModel.updateOne({ _id: crossID }, { $set: { weekly: weekly } });
    }

    async getConfiguration(ssid: string): Promise<Cross> {
        const aggregations = [
            { $match: { ssid: ssid } },
            {
                $lookup: {
                    from: 'emqxauthrules',
                    let: { username: { $concat: [ '$number_plate', '@tecneplas.tld' ] } },
                    as: 'emqxauthrules',
                    pipeline: [
                        { $match: { $expr: { $eq: ['$username', '$$username'] } } }
                    ]
                }
            },{
                $lookup: {
                    from: 'product_models',
                    let: { model: '$model' },
                    as: 'model',
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$model'] } } }
                    ]
                }
            },
            { $unwind: '$model' },
            {
                $lookup: {
                    from: 'crosses_calendars',
                    let: { id_cross: '$_id' },
                    as: 'calendar',
                    pipeline: [
                        { $match: { $expr: { $eq: ['$id_cross', '$$id_cross'] } } },
                        {
                            $lookup: {
                                from: 'sequences',
                                let: { id_sequence: '$id_sequence' },
                                as: 'sequences',
                                pipeline: [
                                    { $match: { $expr: { $eq: ['$_id', '$$id_sequence'] } } },
                                ]
                            }
                        }
                    ]
                }
            },
            { $unwind: '$weekly' },
            { $sort: { 'weekly.day_of_week_number': SortDirection.Ascending } },
            {
                $group: {
                    _id: '$_id', id_pharmacy: { $first: '$id_pharmacy' }, type: { $first: '$type' }, model: { $first: '$model' }, name: { $first: '$name' },
                    connectivity: { $first: '$connectivity' },
                    wifiSSID: { $first: '$wifiSSID' },
                    password: { $first: '$password' },
                    number_plate: { $first: '$number_plate' }, ssid: { $first: '$ssid' },
                    settings: { $first: '$settings'},
                    language: { $first: '$language'},
                    calendar: { $first: '$calendar' },
                    weekly: { $push: '$weekly' },
                    emqxauthrules: { $first: '$emqxauthrules'},
                    offline_services: { $first: '$offline_services'},
                    online_services: { $first: '$online_services'}
                }
            },
            {
                $addFields: {
                    sequences: {
                        $setUnion: [{
                            $reduce: {
                                input: '$weekly.sequences.id_sequence',
                                initialValue: [],
                                in: { $concatArrays: ['$$this', '$$value'] }
                            }
                        }]
                    }
                }
            },
            {
                $lookup: {
                    from: 'sequences',
                    let: { id_sequences: '$sequences' },
                    as: 'sequences',
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$id_sequences'] } } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1, id_pharmacy: 1, type: 1, name: 1, number_plate: 1, model: 1, settings: 1, language: 1, calendar: 1, emqxauthrules: 1, offline_services: 1, online_services: 1, connectivity: 1,
                    wifiSSID: 1,
                    password: 1,
                    weekly: {
                        $map: {
                            input: '$weekly',
                            as: 'day',
                            in: {
                                _id: '$$day._id',
                                day_of_week_number: '$$day.day_of_week_number',
                                day_of_week_name: '$$day.day_of_week_name',
                                sequences: {
                                    $map: {
                                        input: '$$day.sequences',
                                        as: 'day_sequences',
                                        in: {
                                            $mergeObjects: ['$$day_sequences', {
                                                $first: {
                                                    $filter: {
                                                        input: '$sequences',
                                                        cond: { $eq: ['$$this._id', '$$day_sequences.id_sequence'] }
                                                    }
                                                }
                                            }]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ];
        const cross = await this.productModel.aggregate(aggregations);

        if(cross[0]) {
            for(let cal of cross[0]['calendar']){ 
                for(let sequence of cal['sequences']){
                    sequence.from_time = "00:00:00";
                    sequence.to_time = "23:59:59";

                    for(let action of sequence.actions){
                        if(action.available_attributes){
                            delete action.available_attributes;
                        }
                    }
                }
            }
            for(let weekly of cross[0]['weekly']){
                for(let sequence of weekly.sequences){
                    for(let action of sequence.actions){
                        if(action.available_attributes){
                            delete action.available_attributes;
                        }
                    }
                }
            }
        }
        
        return (cross.length == 1) ? cross[0] : false;
    }

    async getByPharmacy(id_pharmacy: string, query?) {
        const aggregations = this.productModel.aggregate();
        if (query && Object.keys(query).length != 0) {
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
                    aggregations.append({ $match: { name: new RegExp(query[i], 'i') } });
                }
                else {
                    let param = {};
                    param[i] = new RegExp(query[i], 'i');
                    aggregations.append({ $match: param });
                }
            }
        }
        aggregations.append(
            { $match: { id_pharmacy:new ObjectId(id_pharmacy) } },
            {
                $lookup: {
                    from: 'pharmacies',
                    localField: 'id_pharmacy',
                    foreignField: '_id',
                    as: 'pharmacy'
                },
            },
            { $unwind: "$pharmacy" },
            {
                $lookup: {
                    from: 'product_models',
                    localField: 'model',
                    foreignField: '_id',
                    as: 'model'
                },
            },
            { $unwind: "$model" }
        );

            
        return await aggregations.exec();
    }

    async getByDistributor(id_distributor: string, query?) {
        const pipeline = [{ $match: { id_distributor:new ObjectId(id_distributor) } }];
        const aggregations = this.pharmacyModel.aggregate(pipeline);

        if (query && Object.keys(query).length != 0) {
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
                    aggregations.append({ $match: { name: new RegExp(query[i], 'i') } });
                }
                else {
                    let param = {};
                    param[i] = new RegExp(query[i], 'i');
                    aggregations.append({ $match: param });
                }
            }
        }

        aggregations.append(
            { $match: { id_distributor:new ObjectId(id_distributor) } },
            {
                $lookup: {
                    from: 'crosses',
                    let: {
                        id_pharmacy: '$_id'
                    },
                    as: 'crosses',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        '$id_pharmacy', '$$id_pharmacy'
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'pharmacies',
                                localField: 'id_pharmacy',
                                foreignField: '_id',
                                as: 'pharmacy'
                            }
                        },
                        { $unwind: "$pharmacy" },
                        {
                            $lookup: {
                                from: 'product_models',
                                localField: 'model',
                                foreignField: '_id',
                                as: 'model'
                            },
                        },
                        { $unwind: "$model" }
                    ]
                }
            }, {
                $unwind: {
                    path: '$crosses',
                    preserveNullAndEmptyArrays: false
                }
            }
        );
        
        const crosses = await aggregations.exec();
        var distributorCrosses = [];
        for(let cross of crosses){
            distributorCrosses.push(cross['crosses']);
        }

        return distributorCrosses;
    }

    async count(query?): Promise<number> {
        const countCrosses = await this.productModel.countDocuments(query);
        return countCrosses;
    }
    
    async countByDistributor(id_distributor): Promise<number> {
        const pipeline = [{ $match: { id_distributor:new ObjectId(id_distributor) } }];
        const aggregations = this.pharmacyModel.aggregate(pipeline);
        aggregations.append(
            { $match: { id_distributor:new ObjectId(id_distributor) } },
            {
                $lookup: {
                    from: 'crosses',
                    let: {
                        id_pharmacy: '$_id'
                    },
                    as: 'crosses',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        '$id_pharmacy', '$$id_pharmacy'
                                    ]
                                }
                            }
                        }
                    ]
                }
            }, {
            $unwind: {
                path: '$crosses',
                preserveNullAndEmptyArrays: false
            }
        });

        const crosses = await aggregations.exec();
        return crosses.length;
    }

    async getWithZip(){
        const pipeline = [{ $match: { status: true } }];
        const aggregations = this.productModel.aggregate(pipeline);

        aggregations.append(
            {
                $lookup: {
                    from: 'pharmacies',
                    let: {
                        id_pharmacy: '$id_pharmacy'
                    },
                    as: 'pharmacy',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        '$_id', '$$id_pharmacy'
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            { $unwind: "$pharmacy" },
            { $addFields: { zip: "$pharmacy.address.zip" } }
            //fer project
        );

        const crosses = await aggregations.exec();
        return crosses;
    }

    async getWeekly(crossId: string): Promise<any[]> {
        const aggregations = [
            { $match: { _id:new ObjectId(crossId) } },
            {
                $addFields: {
                    sequences: {
                        $setUnion: [{
                            $reduce: {
                                input: '$weekly.sequences.id_sequence',
                                initialValue: [],
                                in: { $concatArrays: ['$$this', '$$value'] }
                            }
                        }]
                    }
                }
            },
            {
                $lookup: {
                    from: 'sequences',
                    let: { id_sequences: '$sequences' },
                    as: 'sequences',
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$id_sequences'] } } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    weekly: {
                        $map: {
                            input: '$weekly',
                            as: 'day',
                            in: {
                                _id: '$$day._id',
                                day_of_week_number: '$$day.day_of_week_number',
                                day_of_week_name: '$$day.day_of_week_name',
                                sequences: {
                                    $map: {
                                        input: '$$day.sequences',
                                        as: 'day_sequences',
                                        in: {
                                            $mergeObjects: [{
                                                $first: {
                                                    $filter: {
                                                        input: '$sequences',
                                                        cond: { $eq: ['$$this._id', '$$day_sequences.id_sequence'] }
                                                    }
                                                }
                                            }, '$$day_sequences']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ];

        const cross = await this.productModel.aggregate(aggregations);

        if(cross[0] && cross[0]['weekly']){
            return cross[0]['weekly'];
        }
        else{
            return [];
        }
    }

    async getCalendar(crossId: string): Promise<any[]> {
        const aggregations = [
            { $match: { _id:new ObjectId(crossId) } },
            {
                $lookup: {
                    from: 'crosses_calendars',
                    let: { id_cross: '$_id' },
                    as: 'crosses_calendars',
                    pipeline: [
                        { $match: { $expr: { $eq: ['$id_cross', '$$id_cross'] } } },
                        {
                            $lookup: {
                                from: 'sequences',
                                let: { id_sequence: '$id_sequence' },
                                as: 'sequences',
                                pipeline: [
                                    { $match: { $expr: { $eq: ['$_id', '$$id_sequence'] } } },
                                ]
                            }
                        }
                    ]
                }
            }
        ];

        const cross = await this.productModel.aggregate(aggregations);
        for (let calendar of cross[0]['crosses_calendars']) {
            delete calendar.id_sequence;
        }
        return cross[0]['crosses_calendars'];
    }

    async changeCrossmode(updatedCross) {
        this.sendSequences(updatedCross);
    }

    /* *****************
    *
    * EMQX COMMUNICATION FUNCTIONS
    *
    * *****************/

    async sendWeekly(crossId) {
        const weekly = await this.getWeekly(crossId);
        const cross = await this.findById(crossId);
        
        if (cross.mode == Mode.normal) {
            let topicWeekly = 'tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate + '/weekly';
            console.log('Checking mqtt connection...');
            if (this.mqttService.connected) {
                console.log('Publishing...');
                this.mqttService.client.publish(topicWeekly, JSON.stringify(weekly), { qos: 0, retain: true });
                console.log('Published!');
            }
        }
    }

    async deleteFromCalendar(crossCalId, crossId){
        var cross = await this.productModel.findById(crossId);
        cross.calendar.splice(cross.calendar.indexOf(crossCalId), 1);
        const updatedCross = await this.productModel.findOneAndUpdate({_id: crossId}, cross);
        
        return updatedCross;
    }

    async sendCalendar(crossId) {
        const calendar = await this.getCalendar(crossId);
        for(let cal of calendar){
            for(let sequence of cal['sequences']){
                sequence.from_time = "00:00:00",
                sequence.to_time = "23:59:59"
            }
        }
        const cross = await this.findById(crossId);
        if (cross.mode == Mode.normal) {
            let topicCalendar = 'tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate + '/calendar';
            console.log('Checking mqtt connection...');
            if (this.mqttService.connected) {
                console.log('Publishing...');
                this.mqttService.client.publish(topicCalendar, JSON.stringify(calendar), { qos: 0, retain: true });
                console.log('Published!');
            }
        }
    }

    async sendCrossData(crossId) {
        this.sendWeekly(crossId);
        this.sendCalendar(crossId);
    }

    async sendSequences(cross) {
        let category = null;
        var modeNormal = Object.keys(SequenceCategory)[Object.values(SequenceCategory).indexOf(SequenceCategory.daily)];
        var modeGuard = Object.keys(SequenceCategory)[Object.values(SequenceCategory).indexOf(SequenceCategory.on_guard)];
        var modeHoliday = Object.keys(SequenceCategory)[Object.values(SequenceCategory).indexOf(SequenceCategory.holiday)];

        if (cross.mode == Mode.guardia) category = modeGuard;
        if (cross.mode == Mode.cerrado) category = modeHoliday;
        if (cross.mode == Mode.normal) category = modeNormal;

        if (category == modeGuard || category == modeHoliday) {
            const sequences = await this.sequenceService.findDefaultSequencesByCategory(cross._id, category);

            if (sequences) {
                let topic = 'tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate + '/mode';
                if (this.mqttService.connected) {
                    this.mqttService.client.publish(topic, JSON.stringify({ mode: cross.mode, sequences: sequences }), { qos: 0, retain: true });
                }
            }
        }
        else{
            let topic = 'tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate + '/mode';
            if (this.mqttService.connected) {
                this.mqttService.client.publish(topic, JSON.stringify({ mode: cross.mode }), { qos: 0, retain: true });
                this.sendCrossData(cross._id);
            }
        }
    }

    async sendCrossSettings(cross){
        let topic = 'tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate + '/settings';
        console.log('Checking mqtt connection...');
        if (this.mqttService.connected) {
            console.log('Publishing...');
            cross.settings['wifiSSID'] = cross.wifiSSID;
            cross.settings['password'] = cross.password;
            this.mqttService.client.publish(topic, JSON.stringify(cross.settings), { qos: 0, retain: true });
            console.log('Published!');
        }        
    }

    async updateServices(crossId, pharmacyId, services){
        services.online_services = await this.getOnlineServiceData(pharmacyId, services.online_services);

        const updatedCross = await this.update(crossId, services);
        return updatedCross;
    }

    async getOnlineServiceData(pharmacyId, online_services){
        console.log(pharmacyId);
        const pharmacy = await this.pharmacyModel.findById(pharmacyId);
        if(online_services && online_services.length > 0 && pharmacy.address && pharmacy.address.zip){
            let onlineServices = await this.onlineServicesModel.findOne({zip: pharmacy.address.zip});
            let weatherData;
            if(onlineServices){
                weatherData = {zip: pharmacy.address.zip, data: onlineServices.weather_data};
            }            
            else{
                let data = await this.onlineServicesService.getOnlineServices(pharmacy.address.zip);
                weatherData = {zip: pharmacy.address.zip, data: data.data};
            }
            
            for(let onlineService of online_services){
                if(onlineService.active == true){
                    onlineService = await this.saveWeatherData(onlineService, weatherData);
                }else {
                    onlineService.data = null;
                }
            }
        }
        return online_services;
    }

    async saveWeatherData(onlineService, weatherData){
        switch(onlineService.name){
            case Type.temperature: 
                onlineService.data = { value: weatherData.data['main']['temp']};
                break;
            case Type.feels_like: 
                onlineService.data = { value: weatherData.data['main']['feels_like']};
                break;
            case Type.weather: 
                onlineService.data = { weathers: weatherData.data['weather'] };
                break;
            case Type.wind: 
                onlineService.data = weatherData.data['wind'];
                break;
            case Type.pressure: 
                onlineService.data = { value: weatherData.data['main']['pressure']};
                break;
            case Type.humidity: 
                onlineService.data = { value: weatherData.data['main']['humidity']};
                break;
        }
        return onlineService;
    }

    async sendServices(cross){
        await this.update(cross._id, cross);
        let topic = 'tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate + '/services';
        console.log('Checking mqtt connection...');
        if (this.mqttService.connected) {
            console.log('Publishing...');
            const data ={
                online_services: cross.online_services,
                offline_services: cross.offline_services
            }
            this.mqttService.client.publish(topic, JSON.stringify(data), { qos: 0, retain: true });
            console.log('Published!');
        }   
    }

    async findAllWithErrors(user): Promise<Cross[]> {
        

        const aggregations = this.productModel.aggregate();
        aggregations.append(
            {
                $lookup: {
                    from: 'pharmacies',
                    localField: 'id_pharmacy',
                    foreignField: '_id',
                    as: 'pharmacy'
                },
            },
            { $unwind: "$pharmacy" }
        );

        if(user.role == UserRole.distributor){
            aggregations.append(                 
                {
                    $lookup: {
                        from: 'distributors',
                        let: { id_distributor: user['id_distributor'] },
                        as: 'distributor',
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$id_distributor'] } } },
                        ]
                    },
                }
            );
        }
        aggregations.append(
            {
                $lookup: {
                    from: 'errors',
                    localField: '_id',
                    foreignField: 'id_cross',
                    as: 'error'
                },
            },
            { $unwind: "$error" },
            {
                $lookup: {
                    from: 'product_models',
                    localField: 'model',
                    foreignField: '_id',
                    as: 'model'
                },
            },
            { $unwind: "$model" },
            {
                $project: { _id: 1, name: 1, number_plate: 1, model: 1, error: 1, pharmacy: 1 }
            },
            {
                $sort: { 'error.date': -1 } 
            },
            {
                $limit: 200
            }
        )

        const errors = await aggregations.exec();
        return errors;
    }
}
