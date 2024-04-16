import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CronJob } from 'cron';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CrossService } from './cross.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OnlineServices, OnlineServicesDocument } from '../schemas/online-services.schema';

@Injectable()
export class OnlineServicesService {
    public pageSize = 59;
    public apiTimeout = 60000;

    constructor(
        @InjectModel(OnlineServices.name) private readonly onlineServicesModel: Model<OnlineServicesDocument>,
        private schedulerRegistry: SchedulerRegistry,
        @Inject(forwardRef(() => CrossService))
        private crossService: CrossService,
        private httpService: HttpService
    ) { }

    async addCronJob() {
        let name = 'onlineServiceCall';
        const job = new CronJob(CronExpression.EVERY_HOUR, async () => {
            const crosses = await this.crossService.getWithZip();
            var zips = [];
            for (let cross of crosses) {
                if (!zips.includes(cross.zip)) {
                    zips.push(cross.zip);
                }
            }
            
            const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            if (zips) {
                var pages = Math.ceil(zips.length / this.pageSize);
                for (let page = 1; page <= pages; page++) {
                    var paginatedZips = zips.slice((page - 1) * this.pageSize, page * this.pageSize);
                    for (let zip of paginatedZips) {
                        this.getOnlineServices(zip).then(async(res) => {
                            let weatherData = res;
                            for(let zipCross of crosses){
                                if(zipCross.zip == zip){
                                    for(let online_services of zipCross.online_services){
                                        online_services = await this.crossService.saveWeatherData(online_services, weatherData);
                                    }
                                    await this.crossService.sendServices(zipCross);
                                }                            
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    }
                    await sleep(2000);
                }
            }
        });

        this.schedulerRegistry.addCronJob(name, job);
        job.start();
    }

    paginate(zips, page_size, page_number) {
        return zips.slice((page_number - 1) * page_size, page_number * page_size);
    }

    async getOnlineServices(zip): Promise<any>{
        try{
            let weatherData = await firstValueFrom(
                this.httpService.get(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},es&units=metric&lang=es&appid=a22e080a6bfedc897254740de0b70713`)
            );
            await this.onlineServicesModel.findOneAndUpdate({zip: zip}, {weather_data: weatherData.data}, { upsert: true });
            return weatherData;
        }catch(e){
            throw new NotFoundException('No se pudo recuperar la información para el ZIP: ' + zip);
        }
    }
}