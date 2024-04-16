import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { MongooseModule } from '@nestjs/mongoose';

import { AttributeController } from './controllers/attribute.controller';
import { CrossController } from './controllers/cross.controller';
import { DistributorController } from './controllers/distributor.controller';
import { ErrorController } from './controllers/error.controller';
import { PharmacyController } from './controllers/pharmacy.controller';
import { SequenceController } from './controllers/sequence.controller';
import { ProviderController } from './controllers/provider.controller';
import { CrossCalendarController } from './controllers/cross-calendar.controller';
import { ServiceController } from './controllers/service.controller';
import { SaintController } from './controllers/saint.controller';
import { ProductModelController } from './controllers/product-model.controller';
import { TimezoneController } from './controllers/timezone.controller'; 
import { ModelAttributeController } from './controllers/model-attribute.controller';
import { ModelSequenceController } from './controllers/model-sequence.controller';

import { AttributeService } from './services/attribute.service';
import { CrossService } from './services/cross.service';
import { DistributorService } from './services/distributor.service';
import { ErrorService } from './services/error.service';
import { PharmacyService } from './services/pharmacy.service';
import { SequenceService } from './services/sequence.service';
import { CrossCalendarService } from './services/cross-calendar.service';
import { ServiceService } from './services/service.service';
import { SaintService } from './services/saint.service'; 
import { UserService } from '../auth/services/user.service';
import { MqttService } from './services/mqtt.service';
import { TimezoneService } from './services/timezone.service';
import { ProductModelService } from './services/product-model.service';
import { ForgottenPasswordService } from '../auth/services/forgottenpassword.service';
import { ModelAttributeService } from './services/model-attribute.service';

import { Cross, CrossSchema } from './schemas/cross.schema';
import { Distributor, DistributorSchema } from './schemas/distributor.schema';
import { Error, ErrorSchema } from './schemas/error.schema';
import { Pharmacy, PharmacySchema } from './schemas/pharmacy.schema';
import { Sequence, SequenceSchema } from './schemas/sequence.schema';
import { CrossCalendar, CrossCalendarSchema } from './schemas/cross-calendar.schema';
import { Service, ServiceSchema } from './schemas/service.schema';
import { Saint, SaintSchema } from './schemas/saint.schema';
import { ProductModel, ProductModelSchema } from './schemas/product-model.schema';
import { UserSchema } from '../auth/schemas/user.schema';
import { DefaultWeeklyDays, DefaultWeeklyDaysSchema } from './schemas/default-weekly.schema';
import { DefaultSequence, DefaultSequenceSchema } from './schemas/default-sequence.schema';
import { Timezone, TimezoneSchema } from './schemas/timezone.schema';
import { EmqxAuthRules, EmqxAuthRulesSchema } from './schemas/emqxauthrules.schema';
import { OnlineServices, OnlineServicesSchema } from './schemas/online-services.schema';
import { ForgottenPassword, ForgottenPasswordSchema } from "../auth/schemas/forgotten-password.schema";
import { ModelAttribute, ModelAttributeSchema } from './schemas/model-attribute.schema';

import { OnlineServicesService } from './services/online-services.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ModelSequenceService } from './services/model-sequence.service';
import { ModelSequence, ModelSequenceSchema } from './schemas/model-sequence.schema';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([{ name: Attribute.name, schema: AttributeSchema }] ),
        MongooseModule.forFeature([{ name: Cross.name, schema: CrossSchema }] ),
        MongooseModule.forFeature([{ name: Distributor.name, schema: DistributorSchema }] ),
        MongooseModule.forFeature([{ name: Error.name, schema: ErrorSchema }] ),
        MongooseModule.forFeature([{ name: Pharmacy.name, schema: PharmacySchema }] ),
        MongooseModule.forFeature([{ name: Sequence.name, schema: SequenceSchema }] ),
        MongooseModule.forFeature([{ name: CrossCalendar.name, schema: CrossCalendarSchema }] ),
        MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }] ),
        MongooseModule.forFeature([{ name: Saint.name, schema: SaintSchema }] ),
        MongooseModule.forFeature([{ name: ProductModel.name, schema: ProductModelSchema }] ),
        MongooseModule.forFeature([{ name: DefaultWeeklyDays.name, schema: DefaultWeeklyDaysSchema }] ),
        MongooseModule.forFeature([{ name: DefaultSequence.name, schema: DefaultSequenceSchema }] ),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }] ),
        MongooseModule.forFeature([{ name: Timezone.name, schema: TimezoneSchema }] ),
        MongooseModule.forFeature([{ name: EmqxAuthRules.name, schema: EmqxAuthRulesSchema }] ),
        MongooseModule.forFeature([{ name: OnlineServices.name, schema: OnlineServicesSchema }] ),
        MongooseModule.forFeature([{ name: ForgottenPassword.name, schema: ForgottenPasswordSchema }] ),
        MongooseModule.forFeature([{ name: ModelAttribute.name, schema: ModelAttributeSchema }] ),
        MongooseModule.forFeature([{ name: ModelSequence.name, schema: ModelSequenceSchema }] ),
        MongooseModule.forFeature([{ name: Attribute.name, schema: AttributeSchema }] ),
        HttpModule
    ],
    providers: [
        AttributeService,
        CrossService,
        DistributorService,
        ErrorService,
        PharmacyService,
        SequenceService,
        CrossCalendarService,
        ServiceService,
        SaintService,
        ProductModelService,
        UserService,
        MqttService,
        TimezoneService,
        OnlineServicesService,
        ForgottenPasswordService,
        ModelAttributeService,
        ModelSequenceService
    ],
    controllers: [
        AttributeController,
        CrossController,
        DistributorController,
        ErrorController,
        PharmacyController,
        SequenceController,
        ProviderController,
        CrossCalendarController,
        ServiceController,
        SaintController,
        ProductModelController,
        TimezoneController,
        ModelAttributeController,
        ModelSequenceController
    ]
})
export class CommonModule {}
