import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Saint, SaintDocument } from '../schemas/saint.schema';
import { MqttService } from './mqtt.service';
import { CrossService } from './cross.service';

@Injectable()
export class SaintService {
    constructor(
        @InjectModel('Saint') private readonly saintModel: Model<SaintDocument>,
        private mqttService: MqttService,
        private crossService: CrossService
        ) {}

    async findAll(): Promise<Saint[]>{
        return await this.saintModel.find();
    }

    async findOne(date: Date): Promise<string[]>{
        const day = new Date(date).getDate();
        const month = new Date(date).getMonth() + 1;

        const saints =  await this.saintModel.find({day: day, month: month});
        var todaysSaints = [];
        for(let saint of saints){
            for(let name of saint.saints){
                todaysSaints.push(name);
            }
        }
        return todaysSaints;
    }

    async create(CreatesainteDTO): Promise<Saint>{

        const saint = new this.saintModel(CreatesainteDTO);
        return await saint.save();
    }

    async send(saints){
        const crosses = await this.crossService.findAll();
        console.log('Checking mqtt connection...');
        if (this.mqttService.connected) {
            console.log('Publishing...');
            for(let cross of crosses){
                let topicSaints = 'tecneplas/' + cross.id_pharmacy + '/' + cross.number_plate +'/saints';
                    this.mqttService.client.publish(topicSaints, JSON.stringify(saints), { qos: 0, retain: true });
            }
            console.log('Published saints!');
        }
    }
}