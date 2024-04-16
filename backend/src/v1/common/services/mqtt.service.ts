import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MqttClient } from 'mqtt';
import { CreateErrorDTO } from '../dto/error.dto';
import { Cross, CrossDocument, Mode } from '../schemas/cross.schema';
import { Category } from '../schemas/error.schema';
import { ErrorService } from './error.service';

const mqtt = require('mqtt');

@Injectable()
export class MqttService{
    public client: MqttClient;
    public connected = false;

    constructor(
        @InjectModel(Cross.name) private readonly productModel: Model<CrossDocument>,
        private errorService: ErrorService,
    ) {}

    connect() {
        const url = (process.env.EMQX_URI) ? process.env.EMQX_URI : 'mqtt://localhost';//'mqtt://dev-broker.tecneplas.com:21883';
        
        const clientName = 'backend@tecneplas.tld';
        const pass = '$ZJgA$sw6dvrFfBvq+HyTU=uRS?Yqy8r=f9H977-V#G@XvPZ-p5y4E+53a_-tpk6';

        this.client = mqtt.connect(url, {
            username: clientName,
            password: pass,
        });

        this.client.on("connect", ()=>{
            console.log('Connected to MQTT broker.');
            this.connected = true;
            this.client.subscribe('tecneplas/+/+/logout', function (err, granted) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Subscribed to topic: ' + 'tecneplas/+/+/logout');
            });
            this.client.subscribe('tecneplas/+/+/login', function (err, granted) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Subscribed to topic: ' + 'tecneplas/+/+/login');
            });
            this.client.subscribe('tecneplas/+/+/status/#', function (err, granted) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Subscribed to topic: ' + 'tecneplas/+/+/status/#');
            });
            this.client.subscribe('tecneplas/+/+/grounding', function (err, granted) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Subscribed to topic: ' + 'tecneplas/+/+/grounding');
            });
            var self = this;
            this.client.on('message', async function (topic, message) {
                console.log('Message received from topic: ' + topic);
                console.log(message.toString());
                var messageProcessed = message.toString().replace("'", '"');
                if(self.IsJsonString(messageProcessed)){
                    var mqttMessage = JSON.parse(messageProcessed);
                    if(topic.endsWith("/login")){
                        console.log(mqttMessage._id + ' -> ONLINE');
                        await self.productModel.findByIdAndUpdate(mqttMessage._id, { status: true }, {new: true});
                    }
                    else if(topic.endsWith("/logout")){
                        await self.productModel.findByIdAndUpdate(mqttMessage._id, { status: false, mode:  Mode.normal}, {new: true});
                    }
                    else if(topic.includes("/status")){
                        //processar i guardar canvis de status
                        var date = new Date();
                        var status = new CreateErrorDTO();
                        if(topic.endsWith('power_supply')){
                            status.category = Category.power_supply;
                            status.device = mqttMessage.device;
                            status.status = mqttMessage.status;
                        }
                        else if(topic.endsWith('fan')){
                            status.category = Category.fan;
                            status.device = mqttMessage.device;
                            status.status = mqttMessage.status;
                        }
                        else if(topic.endsWith('led')){
                            status.category = Category.led;
                            status.leds_ko = mqttMessage.leds_ko;
                            status.leds_message = mqttMessage.leds_message;

                        }else{
                            return false;
                        }
                        status.id_cross = mqttMessage._id;
                        status.date = date;
                        
                        await self.errorService.create(status);
                    }
                    else if(topic.endsWith("/grounding")){
                        await self.productModel.findByIdAndUpdate(mqttMessage._id, { grounding: mqttMessage.grounding }, {new: true});
                    }
                }
                else{
                    console.log('invalid JSON from topic: ' + topic);
                }                
            })
        });
        this.client.on("close", ()=>{
            console.log('Connection to MQTT broker closed.');
            this.connected = false;
        });
    }
    
    IsJsonString(str) {
        if (typeof str!=="string"){
            return false;
        }
        try {
            var json = JSON.parse(str);
            return (typeof json === 'object');
        } catch (e) {
            return false;
        }
    }
}